<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\BillItem;
use App\Modules\Finance\Models\BillPayment;
use App\Modules\Finance\Models\Contact;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co-bill']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->vendor = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Vendor',
        'type'      => 'vendor',
    ]);
    $this->staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('bills index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/bills')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/Bills/Index'));
});

test('staff cannot access bills index', function () {
    $this->actingAs($this->staff)
        ->get('/finance/bills')
        ->assertStatus(403);
});

test('bill can be created', function () {
    $this->actingAs($this->admin)
        ->post('/finance/bills', [
            'contact_id' => $this->vendor->id,
            'issue_date' => '2026-01-01',
            'due_date'   => '2026-01-31',
            'items'      => [
                ['description' => 'Office Supplies', 'quantity' => 2, 'unit_price' => 50, 'tax_rate' => 0],
            ],
        ])
        ->assertRedirect();

    expect(Bill::where('contact_id', $this->vendor->id)->exists())->toBeTrue();
});

test('bill number is generated on creation', function () {
    $this->actingAs($this->admin)
        ->post('/finance/bills', [
            'issue_date' => '2026-01-01',
            'items'      => [
                ['description' => 'Service', 'quantity' => 1, 'unit_price' => 100, 'tax_rate' => 0],
            ],
        ])
        ->assertRedirect();

    $bill = Bill::where('tenant_id', $this->tenant->id)->latest()->first();
    expect($bill->number)->toStartWith('BILL-');
});

test('bill starts in draft status', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    expect($bill->status)->toBe('draft');
});

test('bill total is calculated correctly', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    BillItem::create([
        'bill_id'     => $bill->id,
        'description' => 'Item A',
        'quantity'    => 2,
        'unit_price'  => 100,
        'tax_rate'    => 10,
    ]);

    $bill->load(['items', 'payments']);

    expect($bill->subtotal)->toBe(200.0);
    expect($bill->tax_total)->toBe(20.0);
    expect($bill->total)->toBe(220.0);
});

test('bill transitions to received via http', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/bills/{$bill->id}/receive")
        ->assertRedirect();

    expect($bill->fresh()->status)->toBe('received');
});

test('bill cannot skip from draft to paid', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    expect(fn () => $bill->transitionTo('paid'))->toThrow(\DomainException::class);
});

test('recording payment on received bill auto-transitions to paid', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'received',
    ]);
    BillItem::create([
        'bill_id'     => $bill->id,
        'description' => 'Work',
        'quantity'    => 1,
        'unit_price'  => 100,
        'tax_rate'    => 0,
    ]);

    $this->actingAs($this->admin)
        ->post("/finance/bills/{$bill->id}/payments", [
            'amount'       => '100.00',
            'payment_date' => now()->toDateString(),
            'method'       => 'bank_transfer',
        ])
        ->assertRedirect();

    expect($bill->fresh()->status)->toBe('paid');
    expect(BillPayment::where('bill_id', $bill->id)->exists())->toBeTrue();
});

test('bill can be cancelled', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/bills/{$bill->id}/cancel")
        ->assertRedirect();

    expect($bill->fresh()->status)->toBe('cancelled');
});

test('draft bill can be deleted', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->delete("/finance/bills/{$bill->id}")
        ->assertRedirect('/finance/bills');

    expect(Bill::withTrashed()->find($bill->id)->deleted_at)->not->toBeNull();
});

test('staff cannot delete a bill', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->staff)
        ->delete("/finance/bills/{$bill->id}")
        ->assertStatus(403);
});

test('staff cannot create a bill', function () {
    $this->actingAs($this->staff)
        ->post('/finance/bills', [
            'issue_date' => '2026-01-01',
            'items'      => [['description' => 'X', 'quantity' => 1, 'unit_price' => 10, 'tax_rate' => 0]],
        ])
        ->assertStatus(403);
});

test('payment cannot be recorded on a draft bill', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    // status is 'draft' — payment should be rejected
    $this->actingAs($this->admin)
        ->post("/finance/bills/{$bill->id}/payments", [
            'amount'       => '50.00',
            'payment_date' => now()->toDateString(),
            'method'       => 'cash',
        ])
        ->assertSessionHasErrors('status');

    expect(BillPayment::where('bill_id', $bill->id)->exists())->toBeFalse();
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\BatchPayment;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Batch Co', 'slug' => 'batch-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Customer A',
        'type'      => 'customer',
    ]);
});

/**
 * Create an open invoice with items so that total is computed correctly.
 */
function makeInvoice(float $amount = 100.0, array $attrs = []): Invoice
{
    $invoice = Invoice::create(array_merge([
        'tenant_id'     => test()->tenant->id,
        'contact_id'    => test()->contact->id,
        'number'        => 'INV-' . rand(1000, 9999),
        'status'        => 'sent',
        'issue_date'    => now()->toDateString(),
        'due_date'      => now()->addDays(30)->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ], $attrs));

    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => $amount,
        'tax_rate'    => 0,
    ]);

    return $invoice->fresh(['items', 'payments']);
}

test('admin can list batch payments', function () {
    $this->get('/finance/batch-payments')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/BatchPayments/Index'));
});

test('admin can view create form for received', function () {
    $this->get('/finance/batch-payments/create?type=received')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/BatchPayments/Create'));
});

test('admin can view create form for made', function () {
    $this->get('/finance/batch-payments/create?type=made')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/BatchPayments/Create'));
});

test('admin can create batch payment for invoices', function () {
    $inv1 = makeInvoice(100.0);
    $inv2 = makeInvoice(200.0);

    $this->post('/finance/batch-payments', [
        'reference'      => 'BATCH-001',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'bank_transfer',
        'type'           => 'received',
        'payments'       => [
            ['id' => $inv1->id, 'amount' => 100],
            ['id' => $inv2->id, 'amount' => 200],
        ],
    ])->assertRedirect('/finance/batch-payments');

    expect(BatchPayment::where('reference', 'BATCH-001')->exists())->toBeTrue();

    $inv1->refresh();
    $inv2->refresh();
    expect($inv1->status)->toBe('paid');
    expect($inv2->status)->toBe('paid');
});

test('invoice marked paid when fully paid', function () {
    $invoice = makeInvoice(100.0);

    $this->post('/finance/batch-payments', [
        'reference'      => 'BATCH-002',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'cash',
        'type'           => 'received',
        'payments'       => [
            ['id' => $invoice->id, 'amount' => 100],
        ],
    ])->assertRedirect();

    $invoice->refresh();
    expect($invoice->status)->toBe('paid');
});

test('invoice marked partial when partially paid', function () {
    $invoice = makeInvoice(100.0);

    $this->post('/finance/batch-payments', [
        'reference'      => 'BATCH-003',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'cash',
        'type'           => 'received',
        'payments'       => [
            ['id' => $invoice->id, 'amount' => 40],
        ],
    ])->assertRedirect();

    $invoice->refresh();
    expect($invoice->status)->toBe('partial');
});

test('admin can view batch payment', function () {
    $batch = BatchPayment::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'BATCH-VIEW-001',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'bank_transfer',
        'type'           => 'received',
        'total_amount'   => 100,
    ]);

    $this->get("/finance/batch-payments/{$batch->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/BatchPayments/Show'));
});

test('admin can delete batch payment', function () {
    $batch = BatchPayment::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'BATCH-DEL-001',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'bank_transfer',
        'type'           => 'received',
        'total_amount'   => 100,
    ]);

    $this->delete("/finance/batch-payments/{$batch->id}")
        ->assertRedirect('/finance/batch-payments');

    expect(BatchPayment::withTrashed()->find($batch->id)?->deleted_at)->not->toBeNull();
});

test('staff cannot delete batch payment', function () {
    $batch = BatchPayment::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'BATCH-STAFF-001',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'bank_transfer',
        'type'           => 'received',
        'total_amount'   => 100,
    ]);

    $this->actingAs($this->staff)
        ->delete("/finance/batch-payments/{$batch->id}")
        ->assertStatus(403);
});

test('total_amount is sum of all payments', function () {
    $inv1 = makeInvoice(100.0);
    $inv2 = makeInvoice(200.0);

    $this->post('/finance/batch-payments', [
        'reference'      => 'BATCH-TOTAL-001',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'bank_transfer',
        'type'           => 'received',
        'payments'       => [
            ['id' => $inv1->id, 'amount' => 100],
            ['id' => $inv2->id, 'amount' => 200],
        ],
    ])->assertRedirect();

    $batch = BatchPayment::where('reference', 'BATCH-TOTAL-001')->firstOrFail();
    expect((float) $batch->total_amount)->toBe(300.0);
});

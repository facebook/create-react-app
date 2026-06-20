<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\Payment;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant  = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Test Customer', 'type' => 'customer']);
});

test('invoices index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/invoices')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/Invoices/Index'));
});

test('invoice can be created', function () {
    $this->actingAs($this->admin)
        ->post('/finance/invoices', [
            'contact_id' => $this->contact->id,
            'issue_date' => '2026-01-01',
            'due_date'   => '2026-01-31',
            'items'      => [
                ['description' => 'Consulting', 'quantity' => 2, 'unit_price' => 100, 'tax_rate' => 0],
            ],
        ])
        ->assertRedirect();

    expect(Invoice::where('contact_id', $this->contact->id)->exists())->toBeTrue();
});

test('invoice starts in draft status', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    expect($invoice->status)->toBe('draft');
});

test('invoice number is generated on creation', function () {
    $this->actingAs($this->admin)
        ->post('/finance/invoices', [
            'issue_date' => '2026-01-01',
            'items'      => [
                ['description' => 'Service', 'quantity' => 1, 'unit_price' => 50, 'tax_rate' => 0],
            ],
        ]);

    $invoice = Invoice::latest()->first();
    expect($invoice->number)->toStartWith('INV-');
});

test('invoice total is calculated correctly', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Item A', 'quantity' => 2, 'unit_price' => 50, 'tax_rate' => 10]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Item B', 'quantity' => 1, 'unit_price' => 30, 'tax_rate' => 0]);

    $invoice->load('items');

    // Item A: 2 * 50 = 100, tax 10% = 10, total 110
    // Item B: 1 * 30 = 30, tax 0
    expect($invoice->total)->toBe(140.0);
});

test('invoice transitions from draft to sent', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $invoice->transitionTo('sent');
    expect($invoice->fresh()->status)->toBe('sent');
});

test('invoice cannot skip from draft to paid', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    expect(fn () => $invoice->transitionTo('paid'))->toThrow(\DomainException::class);
});

test('invoice transitions to paid when fully paid via http', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'sent',
    ]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Work', 'quantity' => 1, 'unit_price' => 200, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->post("/finance/invoices/{$invoice->id}/payments", [
            'amount'       => '200.00',
            'payment_date' => now()->toDateString(),
            'method'       => 'bank_transfer',
        ])
        ->assertRedirect();

    expect($invoice->fresh()->status)->toBe('paid');
    expect(Payment::where('invoice_id', $invoice->id)->exists())->toBeTrue();
});

test('invoice can be cancelled from draft', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/invoices/{$invoice->id}/cancel")
        ->assertRedirect();

    expect($invoice->fresh()->status)->toBe('cancelled');
});

test('invoice send endpoint works', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/invoices/{$invoice->id}/send")
        ->assertRedirect();

    expect($invoice->fresh()->status)->toBe('sent');
});

test('draft invoice can be deleted', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->delete("/finance/invoices/{$invoice->id}")
        ->assertRedirect('/finance/invoices');

    expect(Invoice::withTrashed()->find($invoice->id)->deleted_at)->not->toBeNull();
});

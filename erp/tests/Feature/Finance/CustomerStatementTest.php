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
    $this->tenant  = Tenant::create(['name' => 'Stmt Co', 'slug' => 'stmt-co']);
    $this->admin   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
    $this->contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Customer A',
        'type'      => 'customer',
    ]);
});

/**
 * Helper: create an invoice with a single line item for the given total.
 */
function makeStmtInvoice(string $issueDate, float $total, float $amountPaid = 0, string $status = 'sent'): Invoice
{
    $invoice = Invoice::create([
        'tenant_id'     => test()->tenant->id,
        'contact_id'    => test()->contact->id,
        'number'        => 'INV-' . rand(1000, 9999),
        'status'        => $status,
        'issue_date'    => $issueDate,
        'due_date'      => $issueDate,
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => $total,
        'tax_rate'    => 0,
    ]);

    if ($amountPaid > 0) {
        Payment::create([
            'tenant_id'    => test()->tenant->id,
            'invoice_id'   => $invoice->id,
            'amount'       => $amountPaid,
            'payment_date' => $issueDate,
            'method'       => 'cash',
        ]);
    }

    return $invoice->fresh(['items', 'payments']);
}

test('statement page loads without contact', function () {
    $this->get('/finance/reports/customer-statement')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/CustomerStatement')
            ->has('contacts')
            ->where('contact', null)
        );
});

test('statement page loads with contact', function () {
    $this->get("/finance/reports/customer-statement?contact_id={$this->contact->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/CustomerStatement')
            ->has('contacts')
            ->has('lines')
            ->has('summary')
        );
});

test('invoice appears in statement lines', function () {
    makeStmtInvoice('2026-05-15', 200);

    $this->get("/finance/reports/customer-statement?contact_id={$this->contact->id}&from=2026-05-01&to=2026-05-31")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->has('lines', 1)
        );
});

test('draft invoice is excluded from statement', function () {
    makeStmtInvoice('2026-05-15', 100, 0, 'draft');

    $this->get("/finance/reports/customer-statement?contact_id={$this->contact->id}&from=2026-05-01&to=2026-05-31")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('lines', [])
        );
});

test('paid invoice shows payment line', function () {
    makeStmtInvoice('2026-05-15', 100, 50, 'partial');

    $response = $this->get("/finance/reports/customer-statement?contact_id={$this->contact->id}&from=2026-05-01&to=2026-05-31");
    $response->assertStatus(200);

    $lines = $response->original->getData()['page']['props']['lines'];
    $types = array_column($lines, 'type');
    expect($types)->toContain('Payment');
});

test('closing balance is sum of invoices minus paid', function () {
    makeStmtInvoice('2026-05-15', 100, 30, 'partial');

    $this->get("/finance/reports/customer-statement?contact_id={$this->contact->id}&from=2026-05-01&to=2026-05-31")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('summary.closing_balance', 70)
        );
});

test('opening balance includes invoices before from date', function () {
    // Invoice before the range (no payment, so full 150 is outstanding)
    makeStmtInvoice('2026-04-10', 150);

    $this->get("/finance/reports/customer-statement?contact_id={$this->contact->id}&from=2026-05-01&to=2026-05-31")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('summary.opening_balance', 150)
        );
});

test('CSV export returns correct content type', function () {
    makeStmtInvoice('2026-05-15', 200);

    $response = $this->get("/finance/reports/customer-statement/export?contact_id={$this->contact->id}&from=2026-05-01&to=2026-05-31");

    $response->assertStatus(200);
    expect($response->headers->get('Content-Type'))->toContain('text/csv');
});

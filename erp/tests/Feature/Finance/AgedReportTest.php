<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\BillItem;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Aged Co', 'slug' => 'aged-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Customer',
        'type'      => 'customer',
    ]);
});

test('aged receivables page loads', function () {
    $this->get('/finance/reports/aged-receivables')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/Reports/AgedReceivables'));
});

test('aged payables page loads', function () {
    $this->get('/finance/reports/aged-payables')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/Reports/AgedPayables'));
});

test('overdue invoice appears in correct bucket', function () {
    Carbon::setTestNow('2026-06-02');

    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->contact->id,
        'issue_date' => '2026-04-01',
        'due_date'   => '2026-04-18',
        'status'     => 'sent',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => 500,
        'tax_rate'    => 0,
    ]);

    // due_date 2026-04-18, as_of 2026-06-02 → 45 days overdue → bucket 31-60
    $this->get('/finance/reports/aged-receivables?as_of=2026-06-02')
        ->assertInertia(fn ($p) => $p
            ->has('rows', 1)
            ->where('rows.0.bucket', '31-60')
        );

    Carbon::setTestNow();
});

test('current invoice appears in current bucket', function () {
    Carbon::setTestNow('2026-06-02');

    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->contact->id,
        'issue_date' => '2026-06-01',
        'due_date'   => '2026-06-10',
        'status'     => 'sent',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => 200,
        'tax_rate'    => 0,
    ]);

    // due_date is in the future → bucket = current
    $this->get('/finance/reports/aged-receivables?as_of=2026-06-02')
        ->assertInertia(fn ($p) => $p
            ->has('rows', 1)
            ->where('rows.0.bucket', 'current')
        );

    Carbon::setTestNow();
});

test('summary totals are correct', function () {
    Carbon::setTestNow('2026-06-02');

    $invoice1 = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->contact->id,
        'issue_date' => '2026-04-01',
        'due_date'   => '2026-04-02',
        'status'     => 'sent',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice1->id,
        'description' => 'Item 1',
        'quantity'    => 1,
        'unit_price'  => 100,
        'tax_rate'    => 0,
    ]);

    $invoice2 = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->contact->id,
        'issue_date' => '2026-04-01',
        'due_date'   => '2026-04-02',
        'status'     => 'sent',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice2->id,
        'description' => 'Item 2',
        'quantity'    => 1,
        'unit_price'  => 200,
        'tax_rate'    => 0,
    ]);

    $this->get('/finance/reports/aged-receivables?as_of=2026-06-02')
        ->assertInertia(fn ($p) => $p
            ->has('rows', 2)
            ->where('grand_total', 300)
        );

    Carbon::setTestNow();
});

test('draft invoices are excluded from aged receivables', function () {
    Carbon::setTestNow('2026-06-02');

    // Draft invoice — should be excluded
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->contact->id,
        'issue_date' => '2026-04-01',
        'due_date'   => '2026-04-02',
        'status'     => 'draft',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Draft Item',
        'quantity'    => 1,
        'unit_price'  => 500,
        'tax_rate'    => 0,
    ]);

    $this->get('/finance/reports/aged-receivables?as_of=2026-06-02')
        ->assertInertia(fn ($p) => $p->has('rows', 0));

    Carbon::setTestNow();
});

test('aged receivables csv export works', function () {
    $this->get('/finance/reports/aged-receivables/export?as_of=2026-06-02')
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('aged payables csv export works', function () {
    $this->get('/finance/reports/aged-payables/export?as_of=2026-06-02')
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('aged payables shows overdue bill in correct bucket', function () {
    Carbon::setTestNow('2026-06-02');

    $vendor = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Vendor',
        'type'      => 'vendor',
    ]);

    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $vendor->id,
        'issue_date' => '2026-04-01',
        'due_date'   => '2026-05-15',
        'status'     => 'received',
    ]);
    BillItem::create([
        'bill_id'     => $bill->id,
        'description' => 'Supplies',
        'quantity'    => 1,
        'unit_price'  => 300,
        'tax_rate'    => 0,
    ]);

    // due_date 2026-05-15, as_of 2026-06-02 → 18 days overdue → bucket 1-30
    $this->get('/finance/reports/aged-payables?as_of=2026-06-02')
        ->assertInertia(fn ($p) => $p
            ->has('rows', 1)
            ->where('rows.0.bucket', '1-30')
        );

    Carbon::setTestNow();
});

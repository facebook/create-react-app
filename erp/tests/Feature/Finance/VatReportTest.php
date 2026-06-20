<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\BillItem;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'VAT Co', 'slug' => 'vat-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('vat report is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/vat-report')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/VatReport')
            ->has('output_lines')
            ->has('input_lines')
            ->has('total_output_vat')
            ->has('total_input_vat')
            ->has('net_vat')
        );
});

test('vat report shows zero totals with no transactions', function () {
    $this->actingAs($this->admin)
        ->get('/finance/reports/vat-report?from=2020-01-01&to=2020-12-31')
        ->assertInertia(fn ($p) => $p
            ->where('total_output_vat', 0)
            ->where('total_input_vat', 0)
            ->where('net_vat', 0)
        );
});

test('output vat calculated correctly from invoices', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C', 'type' => 'customer']);
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => '2026-06-01',
        'status'     => 'sent',
    ]);
    // net = 1000, tax = 200 (20%)
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Svc', 'quantity' => 1, 'unit_price' => 1000, 'tax_rate' => 20]);

    $this->actingAs($this->admin)
        ->get('/finance/reports/vat-report?from=2026-06-01&to=2026-06-30')
        ->assertInertia(fn ($p) => $p
            ->where('total_output_vat', 200)
            ->has('output_lines', 1)
        );
});

test('input vat calculated correctly from bills', function () {
    $supplier = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'S', 'type' => 'vendor']);
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $supplier->id,
        'issue_date' => '2026-06-01',
        'status'     => 'received',
    ]);
    // net = 500, tax = 50 (10%)
    BillItem::create(['bill_id' => $bill->id, 'description' => 'Supply', 'quantity' => 1, 'unit_price' => 500, 'tax_rate' => 10]);

    $this->actingAs($this->admin)
        ->get('/finance/reports/vat-report?from=2026-06-01&to=2026-06-30')
        ->assertInertia(fn ($p) => $p
            ->where('total_input_vat', 50)
            ->has('input_lines', 1)
        );
});

test('net vat is output minus input', function () {
    $contact  = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C2', 'type' => 'customer']);
    $supplier = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'S2', 'type' => 'vendor']);

    $invoice = Invoice::create(['tenant_id' => $this->tenant->id, 'contact_id' => $contact->id, 'issue_date' => '2026-06-15', 'status' => 'sent']);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'A', 'quantity' => 1, 'unit_price' => 1000, 'tax_rate' => 20]);

    $bill = Bill::create(['tenant_id' => $this->tenant->id, 'contact_id' => $supplier->id, 'issue_date' => '2026-06-15', 'status' => 'received']);
    BillItem::create(['bill_id' => $bill->id, 'description' => 'B', 'quantity' => 1, 'unit_price' => 500, 'tax_rate' => 10]);

    // net_vat = 200 - 50 = 150
    $this->actingAs($this->admin)
        ->get('/finance/reports/vat-report?from=2026-06-01&to=2026-06-30')
        ->assertInertia(fn ($p) => $p->where('net_vat', 150));
});

test('cancelled invoices excluded from vat report', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C3', 'type' => 'customer']);
    $invoice = Invoice::create(['tenant_id' => $this->tenant->id, 'contact_id' => $contact->id, 'issue_date' => '2026-06-01', 'status' => 'cancelled']);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'X', 'quantity' => 1, 'unit_price' => 1000, 'tax_rate' => 20]);

    $this->actingAs($this->admin)
        ->get('/finance/reports/vat-report?from=2026-06-01&to=2026-06-30')
        ->assertInertia(fn ($p) => $p->where('total_output_vat', 0));
});

test('zero-tax lines excluded from output_lines', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C4', 'type' => 'customer']);
    $invoice = Invoice::create(['tenant_id' => $this->tenant->id, 'contact_id' => $contact->id, 'issue_date' => '2026-06-01', 'status' => 'sent']);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Y', 'quantity' => 1, 'unit_price' => 500, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->get('/finance/reports/vat-report?from=2026-06-01&to=2026-06-30')
        ->assertInertia(fn ($p) => $p->has('output_lines', 0));
});

test('staff cannot access vat report', function () {
    $this->actingAs($this->staff)
        ->get('/finance/reports/vat-report')
        ->assertStatus(403);
});

test('guest cannot access vat report', function () {
    $this->get('/finance/reports/vat-report')->assertRedirect();
});

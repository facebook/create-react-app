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
    $this->tenant = Tenant::create(['name' => 'Cash Co', 'slug' => 'cash-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->customer = Contact::create([
        'tenant_id' => $this->tenant->id, 'name' => 'Customer A', 'type' => 'customer',
    ]);
    $this->vendor = Contact::create([
        'tenant_id' => $this->tenant->id, 'name' => 'Vendor B', 'type' => 'vendor',
    ]);
});

test('cash flow forecast page loads', function () {
    $this->get('/finance/reports/cash-flow-forecast')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/Reports/CashFlowForecast'));
});

test('page accepts weeks parameter', function () {
    $this->get('/finance/reports/cash-flow-forecast?weeks=4')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Finance/Reports/CashFlowForecast')
            ->where('weeks', 4)
        );
});

test('open invoice appears as inflow', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->customer->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(7)->toDateString(),
        'status'     => 'sent',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => 500,
        'tax_rate'    => 0,
    ]);

    $this->get('/finance/reports/cash-flow-forecast?weeks=4')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('totalInflow', fn ($v) => $v > 0)
        );
});

test('open bill appears as outflow', function () {
    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->vendor->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(7)->toDateString(),
        'status'     => 'received',
    ]);
    BillItem::create([
        'bill_id'     => $bill->id,
        'description' => 'Supplies',
        'quantity'    => 1,
        'unit_price'  => 300,
        'tax_rate'    => 0,
    ]);

    $this->get('/finance/reports/cash-flow-forecast?weeks=4')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('totalOutflow', fn ($v) => $v > 0)
        );
});

test('paid invoice is excluded', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->customer->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(7)->toDateString(),
        'status'     => 'paid',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => 500,
        'tax_rate'    => 0,
    ]);

    $this->get('/finance/reports/cash-flow-forecast?weeks=4')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('totalInflow', fn ($v) => $v == 0)
        );
});

test('opening balance affects closing balance', function () {
    $this->get('/finance/reports/cash-flow-forecast?weeks=4&opening_balance=1000')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('openingBalance', fn ($v) => $v == 1000)
            ->where('buckets.0.closing_balance', fn ($v) => $v == 1000)
        );
});

test('net is inflow minus outflow', function () {
    $dueDate = now()->addDays(7)->toDateString();

    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->customer->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => $dueDate,
        'status'     => 'sent',
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => 500,
        'tax_rate'    => 0,
    ]);

    $bill = Bill::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->vendor->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => $dueDate,
        'status'     => 'received',
    ]);
    BillItem::create([
        'bill_id'     => $bill->id,
        'description' => 'Supplies',
        'quantity'    => 1,
        'unit_price'  => 300,
        'tax_rate'    => 0,
    ]);

    $this->get('/finance/reports/cash-flow-forecast?weeks=4')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->where('totalInflow', fn ($v) => $v == 500)
            ->where('totalOutflow', fn ($v) => $v == 300)
        );
});

test('csv export works', function () {
    $this->get('/finance/reports/cash-flow-forecast/export')
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

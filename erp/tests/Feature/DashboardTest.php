<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\BillItem;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Dash Co', 'slug' => 'dash-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('dashboard is accessible to admin', function () {
    $this->actingAs($this->admin)
        ->get('/dashboard')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Dashboard')
            ->has('kpis')
            ->has('monthly_chart')
            ->has('recent_invoices')
            ->has('low_stock')
        );
});

test('dashboard is accessible to staff', function () {
    $this->actingAs($this->staff)
        ->get('/dashboard')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Dashboard'));
});

test('guest is redirected from dashboard', function () {
    $this->get('/dashboard')
        ->assertRedirect();
});

test('kpis show correct revenue this month', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C1', 'type' => 'customer']);
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->startOfMonth(),
        'status'     => 'sent',
    ]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Svc', 'quantity' => 1, 'unit_price' => 500, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->get('/dashboard')
        ->assertInertia(fn ($p) => $p->where('kpis.revenue_this_month', 500));
});

test('kpis outstanding AR counts unpaid invoices', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C2', 'type' => 'customer']);
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => now(),
        'status'     => 'sent',
    ]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Svc', 'quantity' => 2, 'unit_price' => 300, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->get('/dashboard')
        ->assertInertia(fn ($p) => $p->where('kpis.outstanding_ar', 600));
});

test('monthly chart has 12 entries', function () {
    $this->actingAs($this->admin)
        ->get('/dashboard')
        ->assertInertia(fn ($p) => $p->has('monthly_chart', 12));
});

test('recent invoices shows up to 5 entries', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C3', 'type' => 'customer']);
    for ($i = 0; $i < 6; $i++) {
        $inv = Invoice::create(['tenant_id' => $this->tenant->id, 'contact_id' => $contact->id, 'issue_date' => now(), 'status' => 'sent']);
        InvoiceItem::create(['invoice_id' => $inv->id, 'description' => 'Svc', 'quantity' => 1, 'unit_price' => 10, 'tax_rate' => 0]);
    }

    $this->actingAs($this->admin)
        ->get('/dashboard')
        ->assertInertia(fn ($p) => $p->has('recent_invoices', 5));
});

test('low stock alert shows products below threshold', function () {
    $warehouse = Warehouse::create(['tenant_id' => $this->tenant->id, 'name' => 'WH-D']);
    $product   = Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'LOW-01', 'name' => 'Low Item', 'cost_price' => 5, 'sale_price' => 10]);
    StockLevel::create(['tenant_id' => $this->tenant->id, 'product_id' => $product->id, 'warehouse_id' => $warehouse->id, 'quantity' => 3]);

    $this->actingAs($this->admin)
        ->get('/dashboard')
        ->assertInertia(fn ($p) => $p->has('low_stock', 1));
});

test('cancelled invoices do not affect revenue kpi', function () {
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'C4', 'type' => 'customer']);
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->startOfMonth(),
        'status'     => 'cancelled',
    ]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'description' => 'Svc', 'quantity' => 1, 'unit_price' => 999, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->get('/dashboard')
        ->assertInertia(fn ($p) => $p->where('kpis.revenue_this_month', 0));
});

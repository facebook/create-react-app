<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\SalesOrder;
use App\Modules\Finance\Models\SalesOrderItem;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant   = Tenant::create(['name' => 'SO Co', 'slug' => 'so-co']);
    $this->admin    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->customer = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Test Customer', 'type' => 'customer']);
    $this->staff    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

function soWithStock($test): array
{
    $test->actingAs($test->admin);
    app()->instance('tenant', $test->tenant);
    $warehouse = Warehouse::create(['tenant_id' => $test->tenant->id, 'name' => 'WH-1']);
    $product   = Product::create(['tenant_id' => $test->tenant->id, 'sku' => 'SO-P1', 'name' => 'SO Product', 'cost_price' => 10, 'sale_price' => 20]);

    return [$warehouse, $product];
}

test('sales orders index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/sales-orders')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/SalesOrders/Index'));
});

test('staff cannot access sales orders index', function () {
    $this->actingAs($this->staff)
        ->get('/finance/sales-orders')
        ->assertStatus(403);
});

test('sales order can be created', function () {
    $warehouse = Warehouse::create(['tenant_id' => $this->tenant->id, 'name' => 'WH-1']);

    $this->actingAs($this->admin)
        ->post('/finance/sales-orders', [
            'contact_id'   => $this->customer->id,
            'warehouse_id' => $warehouse->id,
            'order_date'   => '2026-01-01',
            'items'        => [
                ['description' => 'Widget', 'quantity' => 1, 'unit_price' => 500, 'tax_rate' => 0],
            ],
        ])
        ->assertRedirect();

    expect(SalesOrder::where('contact_id', $this->customer->id)->exists())->toBeTrue();
});

test('sales order number is generated on creation', function () {
    $this->actingAs($this->admin)
        ->post('/finance/sales-orders', [
            'order_date' => '2026-01-01',
            'items'      => [
                ['description' => 'Service', 'quantity' => 1, 'unit_price' => 100, 'tax_rate' => 0],
            ],
        ])
        ->assertRedirect();

    $so = SalesOrder::where('tenant_id', $this->tenant->id)->latest()->first();
    expect($so->number)->toStartWith('SO-');
});

test('sales order starts in draft status', function () {
    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
    ]);

    expect($so->status)->toBe('draft');
});

test('sales order total is calculated correctly', function () {
    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
    ]);

    SalesOrderItem::create([
        'sales_order_id' => $so->id,
        'description'    => 'Item A',
        'quantity'       => 2,
        'unit_price'     => 100,
        'tax_rate'       => 10,
    ]);

    $so->load(['items']);

    expect($so->subtotal)->toBe(200.0);
    expect($so->tax_total)->toBe(20.0);
    expect($so->total)->toBe(220.0);
});

test('confirm transitions draft to confirmed via http', function () {
    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/sales-orders/{$so->id}/confirm")
        ->assertRedirect();

    expect($so->fresh()->status)->toBe('confirmed');
});

test('draft cannot skip to fulfilled', function () {
    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
    ]);

    expect(fn () => $so->transitionTo('fulfilled'))->toThrow(\DomainException::class);
});

test('fulfilling a confirmed order deducts stock', function () {
    [$warehouse, $product] = soWithStock($this);

    StockMovement::record(['product_id' => $product->id, 'warehouse_id' => $warehouse->id, 'type' => 'in', 'quantity' => 100]);

    $so = SalesOrder::create([
        'tenant_id'    => $this->tenant->id,
        'contact_id'   => $this->customer->id,
        'warehouse_id' => $warehouse->id,
        'order_date'   => now()->toDateString(),
        'status'       => 'confirmed',
        'number'       => 'SO-TEST-1',
    ]);

    $item = SalesOrderItem::create([
        'sales_order_id' => $so->id,
        'product_id'     => $product->id,
        'description'    => 'SO Product',
        'quantity'       => 30,
        'unit_price'     => 20,
        'tax_rate'       => 0,
    ]);

    $this->post("/finance/sales-orders/{$so->id}/fulfill")->assertRedirect();

    $level = StockLevel::where('product_id', $product->id)->where('warehouse_id', $warehouse->id)->first();
    expect((float) $level->quantity)->toBe(70.0);
    expect((float) $item->fresh()->quantity_fulfilled)->toBe(30.0);
    expect($so->fresh()->status)->toBe('fulfilled');
});

test('fulfilling with insufficient stock fails', function () {
    [$warehouse, $product] = soWithStock($this);

    StockMovement::record(['product_id' => $product->id, 'warehouse_id' => $warehouse->id, 'type' => 'in', 'quantity' => 10]);

    $so = SalesOrder::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $warehouse->id,
        'order_date'   => now()->toDateString(),
        'status'       => 'confirmed',
        'number'       => 'SO-TEST-2',
    ]);

    SalesOrderItem::create([
        'sales_order_id' => $so->id,
        'product_id'     => $product->id,
        'description'    => 'SO Product',
        'quantity'       => 50,
        'unit_price'     => 20,
        'tax_rate'       => 0,
    ]);

    $this->post("/finance/sales-orders/{$so->id}/fulfill")->assertSessionHasErrors('status');

    expect($so->fresh()->status)->toBe('confirmed');
    $level = StockLevel::where('product_id', $product->id)->where('warehouse_id', $warehouse->id)->first();
    expect((float) $level->quantity)->toBe(10.0);
});

test('cannot fulfill a draft order', function () {
    [$warehouse, $product] = soWithStock($this);

    $so = SalesOrder::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $warehouse->id,
        'order_date'   => now()->toDateString(),
        'status'       => 'draft',
        'number'       => 'SO-TEST-3',
    ]);

    SalesOrderItem::create([
        'sales_order_id' => $so->id,
        'product_id'     => $product->id,
        'description'    => 'SO Product',
        'quantity'       => 5,
        'unit_price'     => 20,
        'tax_rate'       => 0,
    ]);

    $this->post("/finance/sales-orders/{$so->id}/fulfill")->assertSessionHasErrors('status');
});

test('item with null product is fulfilled without stock movement', function () {
    [$warehouse] = soWithStock($this);

    $so = SalesOrder::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $warehouse->id,
        'order_date'   => now()->toDateString(),
        'status'       => 'confirmed',
        'number'       => 'SO-TEST-4',
    ]);

    $item = SalesOrderItem::create([
        'sales_order_id' => $so->id,
        'product_id'     => null,
        'description'    => 'Free text service',
        'quantity'       => 3,
        'unit_price'     => 50,
        'tax_rate'       => 0,
    ]);

    $this->post("/finance/sales-orders/{$so->id}/fulfill")->assertRedirect();

    expect($so->fresh()->status)->toBe('fulfilled');
    expect((float) $item->fresh()->quantity_fulfilled)->toBe(3.0);
    expect(StockMovement::count())->toBe(0);
});

test('confirmed order can be converted to invoice with items', function () {
    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->customer->id,
        'order_date' => now()->toDateString(),
        'status'     => 'confirmed',
    ]);

    SalesOrderItem::create(['sales_order_id' => $so->id, 'description' => 'A', 'quantity' => 2, 'unit_price' => 150, 'tax_rate' => 10]);
    SalesOrderItem::create(['sales_order_id' => $so->id, 'description' => 'B', 'quantity' => 1, 'unit_price' => 100, 'tax_rate' => 0]);

    $this->actingAs($this->admin)
        ->post("/finance/sales-orders/{$so->id}/convert")
        ->assertRedirect();

    $invoice = Invoice::where('tenant_id', $this->tenant->id)->where('contact_id', $this->customer->id)->latest()->first();
    expect($invoice)->not->toBeNull();
    expect(InvoiceItem::where('invoice_id', $invoice->id)->count())->toBe(2);
    expect($so->fresh()->invoice_id)->not->toBeNull();
});

test('cannot convert an already-invoiced order', function () {
    $invoice = Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->customer->id,
        'issue_date' => now()->toDateString(),
        'status'     => 'draft',
    ]);

    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->customer->id,
        'order_date' => now()->toDateString(),
        'status'     => 'confirmed',
        'invoice_id' => $invoice->id,
    ]);

    $this->actingAs($this->admin)
        ->post("/finance/sales-orders/{$so->id}/convert")
        ->assertSessionHasErrors('status');

    expect(Invoice::where('tenant_id', $this->tenant->id)->count())->toBe(1);
});

test('cannot convert a draft order', function () {
    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
        'status'     => 'draft',
    ]);

    $this->actingAs($this->admin)
        ->post("/finance/sales-orders/{$so->id}/convert")
        ->assertSessionHasErrors('status');
});

test('sales order can be cancelled', function () {
    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->patch("/finance/sales-orders/{$so->id}/cancel")
        ->assertRedirect();

    expect($so->fresh()->status)->toBe('cancelled');
});

test('draft sales order can be deleted', function () {
    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->delete("/finance/sales-orders/{$so->id}")
        ->assertRedirect('/finance/sales-orders');

    expect(SalesOrder::withTrashed()->find($so->id)->deleted_at)->not->toBeNull();
});

test('non-draft sales order cannot be deleted', function () {
    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
        'status'     => 'confirmed',
    ]);

    $this->actingAs($this->admin)
        ->delete("/finance/sales-orders/{$so->id}")
        ->assertStatus(403);
});

test('staff cannot create a sales order', function () {
    $this->actingAs($this->staff)
        ->post('/finance/sales-orders', [
            'order_date' => '2026-01-01',
            'items'      => [['description' => 'X', 'quantity' => 1, 'unit_price' => 10, 'tax_rate' => 0]],
        ])
        ->assertStatus(403);
});

test('guest cannot access sales orders', function () {
    $this->get('/finance/sales-orders')->assertRedirect();
});

// ── Phase 40 — Sales Orders with invoice conversion ──────────────────────

test('admin can list sales orders', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
    $this->get('/finance/sales-orders')->assertStatus(200);
});

test('admin can view create form', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
    $this->get('/finance/sales-orders/create')->assertStatus(200);
});

test('admin can create sales order with reference', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->post('/finance/sales-orders', [
        'contact_id'    => $this->customer->id,
        'reference'     => 'SO-2026-P40',
        'order_date'    => '2026-01-15',
        'currency_code' => 'USD',
        'exchange_rate' => 1,
        'items'         => [
            ['description' => 'Widget', 'quantity' => 2, 'unit_price' => 100, 'tax_rate' => 10],
        ],
    ])->assertRedirect();

    expect(SalesOrder::withoutGlobalScopes()->count())->toBeGreaterThan(0);
    $so = SalesOrder::withoutGlobalScopes()->where('reference', 'SO-2026-P40')->first();
    expect($so)->not->toBeNull();
    expect($so->currency_code)->toBe('USD');
    expect($so->items()->count())->toBe(1);
});

test('admin can view sales order', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
        'reference'  => 'SO-VIEW-P40',
    ]);

    $this->get("/finance/sales-orders/{$so->id}")->assertStatus(200);
});

test('admin can confirm draft order via post', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
        'reference'  => 'SO-CONF-P40',
    ]);

    $this->patch("/finance/sales-orders/{$so->id}/confirm")->assertRedirect();

    expect($so->fresh()->status)->toBe('confirmed');
});

test('confirmed order can be converted to invoice with sales_order_id set', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->customer->id,
        'reference'  => 'SO-INV-P40',
        'order_date' => now()->toDateString(),
        'status'     => 'confirmed',
    ]);

    SalesOrderItem::create([
        'sales_order_id' => $so->id,
        'description'    => 'Phase40 Item',
        'quantity'       => 1,
        'unit_price'     => 500,
        'tax_rate'       => 0,
    ]);

    $this->post("/finance/sales-orders/{$so->id}/convert-to-invoice")->assertRedirect();

    $invoice = Invoice::where('sales_order_id', $so->id)->first();
    expect($invoice)->not->toBeNull();
    expect(InvoiceItem::where('invoice_id', $invoice->id)->count())->toBe(1);
});

test('converted invoice has correct items count', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $this->customer->id,
        'reference'  => 'SO-ITEMS-P40',
        'order_date' => now()->toDateString(),
        'status'     => 'confirmed',
    ]);

    SalesOrderItem::create(['sales_order_id' => $so->id, 'description' => 'Line 1', 'quantity' => 1, 'unit_price' => 100, 'tax_rate' => 0]);
    SalesOrderItem::create(['sales_order_id' => $so->id, 'description' => 'Line 2', 'quantity' => 2, 'unit_price' => 50, 'tax_rate' => 10]);

    $this->post("/finance/sales-orders/{$so->id}/convert-to-invoice")->assertRedirect();

    $invoice = Invoice::where('sales_order_id', $so->id)->first();
    expect($invoice)->not->toBeNull();
    expect(InvoiceItem::where('invoice_id', $invoice->id)->count())->toBe(2);
});

test('admin can cancel confirmed order via post', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
        'reference'  => 'SO-CAN-P40',
        'status'     => 'confirmed',
    ]);

    $this->patch("/finance/sales-orders/{$so->id}/cancel")->assertRedirect();

    expect($so->fresh()->status)->toBe('cancelled');
});

test('invoiced order cannot be cancelled', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
        'reference'  => 'SO-INVC-P40',
        'status'     => 'invoiced',
    ]);

    $this->patch("/finance/sales-orders/{$so->id}/cancel")->assertSessionHasErrors();

    expect($so->fresh()->status)->toBe('invoiced');
});

test('staff cannot delete sales order', function () {
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $so = SalesOrder::create([
        'tenant_id'  => $this->tenant->id,
        'order_date' => now()->toDateString(),
        'reference'  => 'SO-DEL-P40',
        'status'     => 'draft',
    ]);

    $this->actingAs($this->staff)
        ->delete("/finance/sales-orders/{$so->id}")
        ->assertStatus(403);
});

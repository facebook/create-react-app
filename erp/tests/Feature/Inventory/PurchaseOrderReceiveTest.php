<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\PurchaseOrder;
use App\Modules\Inventory\Models\PurchaseOrderItem;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant    = Tenant::create(['name' => 'Inv Co', 'slug' => 'inv-co-stock']);
    $this->admin     = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
    $this->warehouse = Warehouse::create(['tenant_id' => $this->tenant->id, 'name' => 'Main', 'is_active' => true]);
    $this->category  = ProductCategory::create(['tenant_id' => $this->tenant->id, 'name' => 'General', 'slug' => 'general-stock', 'colour' => '#6366f1']);
    $this->product   = Product::create([
        'tenant_id'   => $this->tenant->id,
        'category_id' => $this->category->id,
        'name'        => 'Widget',
        'sku'         => 'WDG-001',
        'cost_price'  => 10,
        'sale_price'  => 20,
        'is_active'   => true,
    ]);
});

function makePoSupplier(Tenant $tenant): Supplier {
    return Supplier::create(['tenant_id' => $tenant->id, 'name' => 'Test Supplier', 'is_active' => true]);
}

test('stock movement index is accessible', function () {
    $this->get('/inventory/stock-movements')
        ->assertStatus(200);
});

test('stock can be added via stock movement store', function () {
    $this->post('/inventory/stock-movements', [
            'product_id'   => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type'         => 'in',
            'quantity'     => 50,
            'reference'    => 'TEST-001',
        ])
        ->assertRedirect();

    $level = StockLevel::where('product_id', $this->product->id)->where('warehouse_id', $this->warehouse->id)->first();
    expect($level->quantity)->toBe('50.00');
});

test('stock can be reduced via out movement', function () {
    // First add stock
    StockLevel::create([
        'tenant_id'         => $this->tenant->id,
        'product_id'        => $this->product->id,
        'warehouse_id'      => $this->warehouse->id,
        'quantity'          => 100,
        'reserved_quantity' => 0,
    ]);

    $this->post('/inventory/stock-movements', [
            'product_id'   => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type'         => 'out',
            'quantity'     => 30,
        ])
        ->assertRedirect();

    $level = StockLevel::where('product_id', $this->product->id)->where('warehouse_id', $this->warehouse->id)->first();
    expect((float) $level->quantity)->toBe(70.0);
});

test('purchase order receive form is accessible when status is approved', function () {
    $supplier = makePoSupplier($this->tenant);
    $po = PurchaseOrder::create([
        'tenant_id'    => $this->tenant->id,
        'supplier_id'  => $supplier->id,
        'warehouse_id' => $this->warehouse->id,
        'status'       => 'approved',
        'created_by'   => $this->admin->id,
    ]);
    PurchaseOrderItem::create([
        'purchase_order_id' => $po->id,
        'product_id'        => $this->product->id,
        'quantity'          => 10,
        'unit_cost'         => 5,
    ]);

    $this->get("/inventory/purchase-orders/{$po->id}/receive")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/PurchaseOrders/Receive'));
});

test('purchasing order can be received and creates stock movements', function () {
    $supplier = makePoSupplier($this->tenant);
    $po = PurchaseOrder::create([
        'tenant_id'    => $this->tenant->id,
        'supplier_id'  => $supplier->id,
        'warehouse_id' => $this->warehouse->id,
        'status'       => 'approved',
        'created_by'   => $this->admin->id,
    ]);
    $item = PurchaseOrderItem::create([
        'purchase_order_id' => $po->id,
        'product_id'        => $this->product->id,
        'quantity'          => 20,
        'unit_cost'         => 5,
    ]);

    $this->post("/inventory/purchase-orders/{$po->id}/receive", [
            'lines' => [
                ['id' => $item->id, 'received_quantity' => 20],
            ],
        ])
        ->assertRedirect();

    expect($po->fresh()->status)->toBe('received');
    expect(StockMovement::where('product_id', $this->product->id)->exists())->toBeTrue();
    $level = StockLevel::where('product_id', $this->product->id)->where('warehouse_id', $this->warehouse->id)->first();
    expect((float) $level->quantity)->toBe(20.0);
});

test('out movement cannot exceed available stock', function () {
    $this->post('/inventory/stock-movements', [
            'product_id'   => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'type'         => 'out',
            'quantity'     => 999,
        ])
        ->assertSessionHasErrors('quantity');
});

test('guest cannot record stock movements', function () {
    auth()->logout();
    $this->post('/inventory/stock-movements', [
        'product_id'   => $this->product->id,
        'warehouse_id' => $this->warehouse->id,
        'type'         => 'in',
        'quantity'     => 5,
    ])->assertRedirect();
});

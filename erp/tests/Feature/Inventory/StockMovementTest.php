<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\PurchaseOrder;
use App\Modules\Inventory\Models\PurchaseOrderItem;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant    = Tenant::create(['name' => 'Stock Co', 'slug' => 'stock-co']);
    $this->admin     = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->product   = Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'SM-01', 'name' => 'Stock Item', 'cost_price' => 10, 'sale_price' => 20]);
    $this->warehouse = Warehouse::create(['tenant_id' => $this->tenant->id, 'name' => 'WH-1']);
});

test('stock in movement increases stock level', function () {
    StockMovement::record(['product_id' => $this->product->id, 'warehouse_id' => $this->warehouse->id, 'type' => 'in', 'quantity' => 50]);

    $level = StockLevel::where('product_id', $this->product->id)->where('warehouse_id', $this->warehouse->id)->first();
    expect((float) $level->quantity)->toBe(50.0);
});

test('stock out movement decreases stock level', function () {
    StockMovement::record(['product_id' => $this->product->id, 'warehouse_id' => $this->warehouse->id, 'type' => 'in', 'quantity' => 100]);
    StockMovement::record(['product_id' => $this->product->id, 'warehouse_id' => $this->warehouse->id, 'type' => 'out', 'quantity' => 30]);

    $level = StockLevel::where('product_id', $this->product->id)->where('warehouse_id', $this->warehouse->id)->first();
    expect((float) $level->quantity)->toBe(70.0);
});

test('stock out rejects insufficient stock', function () {
    StockMovement::record(['product_id' => $this->product->id, 'warehouse_id' => $this->warehouse->id, 'type' => 'in', 'quantity' => 10]);

    expect(fn () => StockMovement::record([
        'product_id' => $this->product->id, 'warehouse_id' => $this->warehouse->id, 'type' => 'out', 'quantity' => 50,
    ]))->toThrow(\DomainException::class);
});

test('adjustment movement sets absolute quantity', function () {
    StockMovement::record(['product_id' => $this->product->id, 'warehouse_id' => $this->warehouse->id, 'type' => 'in',         'quantity' => 80]);
    StockMovement::record(['product_id' => $this->product->id, 'warehouse_id' => $this->warehouse->id, 'type' => 'adjustment', 'quantity' => 25]);

    $level = StockLevel::where('product_id', $this->product->id)->where('warehouse_id', $this->warehouse->id)->first();
    expect((float) $level->quantity)->toBe(25.0);
});

test('stock movement records creator user id', function () {
    $movement = StockMovement::record(['product_id' => $this->product->id, 'warehouse_id' => $this->warehouse->id, 'type' => 'in', 'quantity' => 10]);
    expect($movement->created_by)->toBe($this->admin->id);
});

test('stock movement index renders', function () {
    $this->get('/inventory/stock-movements')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/StockMovements/Index'));
});

test('http endpoint records stock movement', function () {
    $response = $this->post('/inventory/stock-movements', [
        'product_id'   => $this->product->id,
        'warehouse_id' => $this->warehouse->id,
        'type'         => 'in',
        'quantity'     => 20,
        'reference'    => 'REF-001',
    ]);

    $response->assertSessionHasNoErrors();
    expect(StockMovement::where('reference', 'REF-001')->exists())->toBeTrue();
});

test('po receive form is accessible when approved', function () {
    $supplier = \App\Modules\Inventory\Models\Supplier::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Supplier',
    ]);

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

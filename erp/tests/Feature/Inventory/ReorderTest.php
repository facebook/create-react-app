<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant    = Tenant::create(['name' => 'Reorder Co', 'slug' => 'reorder-co']);
    $this->admin     = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->warehouse = Warehouse::create(['tenant_id' => $this->tenant->id, 'name' => 'WH-R']);
    $this->supplier  = Supplier::create(['tenant_id' => $this->tenant->id, 'name' => 'Main Supplier']);
});

test('reorder index renders', function () {
    $this->get('/inventory/reorder')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/Reorder/Index'));
});

test('product below reorder point appears in suggestions', function () {
    $product = Product::create([
        'tenant_id'        => $this->tenant->id,
        'sku'              => 'RO-01',
        'name'             => 'Low Widget',
        'cost_price'       => 5,
        'sale_price'       => 10,
        'reorder_point'    => 20,
        'reorder_quantity' => 50,
        'is_active'        => true,
    ]);
    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $this->warehouse->id,
        'quantity'     => 10,
    ]);

    $this->get('/inventory/reorder')
        ->assertInertia(fn ($p) => $p->has('suggestions', 1));
});

test('product above reorder point not in suggestions', function () {
    $product = Product::create([
        'tenant_id'     => $this->tenant->id,
        'sku'           => 'RO-02',
        'name'          => 'Healthy Stock',
        'cost_price'    => 5,
        'sale_price'    => 10,
        'reorder_point' => 10,
        'is_active'     => true,
    ]);
    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $this->warehouse->id,
        'quantity'     => 50,
    ]);

    $this->get('/inventory/reorder')
        ->assertInertia(fn ($p) => $p->has('suggestions', 0));
});

test('product with reorder_point zero never appears', function () {
    $product = Product::create([
        'tenant_id'     => $this->tenant->id,
        'sku'           => 'RO-03',
        'name'          => 'No Reorder Set',
        'cost_price'    => 5,
        'sale_price'    => 10,
        'reorder_point' => 0,
        'is_active'     => true,
    ]);
    // No stock at all
    $this->get('/inventory/reorder')
        ->assertInertia(fn ($p) => $p->has('suggestions', 0));
});

test('needs_reorder accessor works correctly', function () {
    $product = Product::create([
        'tenant_id'     => $this->tenant->id,
        'sku'           => 'RO-04',
        'name'          => 'Accessor Test',
        'cost_price'    => 5,
        'sale_price'    => 10,
        'reorder_point' => 15,
    ]);
    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $this->warehouse->id,
        'quantity'     => 15, // exactly at reorder point
    ]);
    $product->load('stockLevels');
    expect($product->needsReorder())->toBeTrue();
});

test('can create purchase order from reorder suggestions', function () {
    $product = Product::create([
        'tenant_id'        => $this->tenant->id,
        'sku'              => 'RO-05',
        'name'             => 'PO Product',
        'cost_price'       => 8,
        'sale_price'       => 15,
        'reorder_point'    => 10,
        'reorder_quantity' => 30,
        'is_active'        => true,
    ]);

    $this->post('/inventory/reorder/purchase-order', [
        'supplier_id'  => $this->supplier->id,
        'warehouse_id' => $this->warehouse->id,
        'items'        => [
            ['product_id' => $product->id, 'quantity' => 30, 'unit_cost' => 8],
        ],
    ])->assertSessionHasNoErrors();

    expect(\App\Modules\Inventory\Models\PurchaseOrder::where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('guest cannot access reorder page', function () {
    auth()->logout();
    $this->get('/inventory/reorder')->assertRedirect();
});

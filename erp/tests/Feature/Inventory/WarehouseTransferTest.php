<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseTransfer;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant    = Tenant::create(['name' => 'Transfer Co', 'slug' => 'transfer-co']);
    $this->admin     = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->product    = Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'TF-01', 'name' => 'Transfer Item', 'cost_price' => 5, 'sale_price' => 10]);
    $this->warehouseA = Warehouse::create(['tenant_id' => $this->tenant->id, 'name' => 'WH-A']);
    $this->warehouseB = Warehouse::create(['tenant_id' => $this->tenant->id, 'name' => 'WH-B']);

    // Seed stock in WH-A
    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $this->product->id,
        'warehouse_id' => $this->warehouseA->id,
        'quantity'     => 100,
    ]);
});

test('warehouse transfers index renders', function () {
    $this->get('/inventory/warehouse-transfers')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/WarehouseTransfers/Index'));
});

test('warehouse transfers create page renders', function () {
    $this->get('/inventory/warehouse-transfers/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/WarehouseTransfers/Create'));
});

test('transfer moves stock between warehouses', function () {
    $this->post('/inventory/warehouse-transfers', [
        'product_id'        => $this->product->id,
        'from_warehouse_id' => $this->warehouseA->id,
        'to_warehouse_id'   => $this->warehouseB->id,
        'quantity'          => 30,
        'reference'         => 'TRF-001',
    ])->assertSessionHasNoErrors();

    $levelA = StockLevel::where('product_id', $this->product->id)->where('warehouse_id', $this->warehouseA->id)->first();
    $levelB = StockLevel::where('product_id', $this->product->id)->where('warehouse_id', $this->warehouseB->id)->first();

    expect((float) $levelA->quantity)->toBe(70.0);
    expect((float) $levelB->quantity)->toBe(30.0);
});

test('transfer is recorded in warehouse_transfers table', function () {
    $this->post('/inventory/warehouse-transfers', [
        'product_id'        => $this->product->id,
        'from_warehouse_id' => $this->warehouseA->id,
        'to_warehouse_id'   => $this->warehouseB->id,
        'quantity'          => 10,
        'reference'         => 'TRF-002',
    ]);

    expect(WarehouseTransfer::where('reference', 'TRF-002')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('transfer fails when insufficient stock', function () {
    $this->post('/inventory/warehouse-transfers', [
        'product_id'        => $this->product->id,
        'from_warehouse_id' => $this->warehouseA->id,
        'to_warehouse_id'   => $this->warehouseB->id,
        'quantity'          => 999,
    ])->assertSessionHasErrors('quantity');
});

test('cannot transfer to same warehouse', function () {
    $this->post('/inventory/warehouse-transfers', [
        'product_id'        => $this->product->id,
        'from_warehouse_id' => $this->warehouseA->id,
        'to_warehouse_id'   => $this->warehouseA->id,
        'quantity'          => 10,
    ])->assertSessionHasErrors('to_warehouse_id');
});

test('staff cannot create transfers', function () {
    $staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $staff->assignRole('staff');

    $this->actingAs($staff)
        ->post('/inventory/warehouse-transfers', [
            'product_id'        => $this->product->id,
            'from_warehouse_id' => $this->warehouseA->id,
            'to_warehouse_id'   => $this->warehouseB->id,
            'quantity'          => 10,
        ])->assertStatus(403);
});

test('guest is redirected', function () {
    $this->withoutMiddleware(\App\Http\Middleware\HandleInertiaRequests::class);
    auth()->logout();
    $this->get('/inventory/warehouse-transfers')->assertRedirect();
});

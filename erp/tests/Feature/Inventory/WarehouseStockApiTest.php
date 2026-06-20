<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Warehouse Co', 'slug' => 'wh-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function createWarehouse(array $attrs = []): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Warehouse ' . uniqid(),
        'location'  => 'City A',
        'is_active' => true,
        ...$attrs,
    ]);
}

function createInventoryProductForWh(array $attrs = []): Product
{
    return Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Item ' . uniqid(),
        'sku'        => 'SKU-WH-' . uniqid(),
        'cost_price' => 10.00,
        'sale_price' => 20.00,
        'is_active'  => true,
        ...$attrs,
    ]);
}

test('can create a warehouse', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/warehouses', [
            'name'     => 'Main Warehouse',
            'location' => 'London',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Main Warehouse');
});

test('can list warehouses', function () {
    createWarehouse(['name' => 'Store A']);
    createWarehouse(['name' => 'Store B']);

    $data = $this->withToken($this->token)
        ->getJson('/api/v1/warehouses')
        ->assertStatus(200)
        ->json('data');

    expect(count($data))->toBeGreaterThanOrEqual(2);
});

test('can view warehouse with stock levels', function () {
    $wh      = createWarehouse(['name' => 'Detailed WH']);
    $product = createInventoryProductForWh();

    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $wh->id,
        'product_id'   => $product->id,
        'quantity'     => 50,
        'reserved_quantity' => 5,
    ]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/warehouses/{$wh->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'name', 'total_value', 'stock_lines', 'stock_levels']]);

    expect($response->json('data.stock_lines'))->toBe(1);
});

test('can update warehouse', function () {
    $wh = createWarehouse();

    $this->withToken($this->token)
        ->putJson("/api/v1/warehouses/{$wh->id}", ['name' => 'Updated WH', 'is_active' => false])
        ->assertStatus(200)
        ->assertJsonPath('data.is_active', false);
});

test('can set stock level for a product in a warehouse', function () {
    $wh      = createWarehouse();
    $product = createInventoryProductForWh();

    $this->withToken($this->token)
        ->putJson("/api/v1/warehouses/{$wh->id}/stock/{$product->id}", [
            'quantity'          => 100,
            'reserved_quantity' => 10,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.quantity', '100.00');

    expect(StockLevel::where('warehouse_id', $wh->id)->where('product_id', $product->id)->value('quantity'))->toBe('100.00');
});

test('can get stock distribution across warehouses for a product', function () {
    $wh1     = createWarehouse(['name' => 'WH North']);
    $wh2     = createWarehouse(['name' => 'WH South']);
    $product = createInventoryProductForWh();

    StockLevel::create(['tenant_id' => $this->tenant->id, 'warehouse_id' => $wh1->id, 'product_id' => $product->id, 'quantity' => 30, 'reserved_quantity' => 0]);
    StockLevel::create(['tenant_id' => $this->tenant->id, 'warehouse_id' => $wh2->id, 'product_id' => $product->id, 'quantity' => 70, 'reserved_quantity' => 5]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/products/{$product->id}/stock-by-warehouse")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['product_id', 'total_qty', 'total_available', 'warehouses']]);

    expect((float) $response->json('data.total_qty'))->toBe(100.0);
    expect(count($response->json('data.warehouses')))->toBe(2);
});

test('can transfer stock between warehouses', function () {
    $from    = createWarehouse(['name' => 'Source WH']);
    $to      = createWarehouse(['name' => 'Dest WH']);
    $product = createInventoryProductForWh();

    StockLevel::create(['tenant_id' => $this->tenant->id, 'warehouse_id' => $from->id, 'product_id' => $product->id, 'quantity' => 100, 'reserved_quantity' => 0]);

    $this->withToken($this->token)
        ->postJson('/api/v1/warehouses/transfer', [
            'from_warehouse_id' => $from->id,
            'to_warehouse_id'   => $to->id,
            'product_id'        => $product->id,
            'quantity'          => 40,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.transferred', 40);

    $fromLevel = StockLevel::where('warehouse_id', $from->id)->where('product_id', $product->id)->first();
    $toLevel   = StockLevel::where('warehouse_id', $to->id)->where('product_id', $product->id)->first();

    expect((float) $fromLevel->quantity)->toBe(60.0);
    expect((float) $toLevel->quantity)->toBe(40.0);
});

test('transfer fails with insufficient stock', function () {
    $from    = createWarehouse(['name' => 'Empty WH']);
    $to      = createWarehouse(['name' => 'Target WH']);
    $product = createInventoryProductForWh();

    StockLevel::create(['tenant_id' => $this->tenant->id, 'warehouse_id' => $from->id, 'product_id' => $product->id, 'quantity' => 5, 'reserved_quantity' => 0]);

    $this->withToken($this->token)
        ->postJson('/api/v1/warehouses/transfer', [
            'from_warehouse_id' => $from->id,
            'to_warehouse_id'   => $to->id,
            'product_id'        => $product->id,
            'quantity'          => 100,
        ])
        ->assertStatus(422);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/warehouses')->assertStatus(401);
});

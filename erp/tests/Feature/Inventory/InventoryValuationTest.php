<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Valuation Co', 'slug' => 'val-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function createInventoryProduct(array $attrs = []): Product
{
    return Product::create([
        'tenant_id'      => test()->tenant->id,
        'name'           => 'Product ' . uniqid(),
        'sku'            => 'SKU-' . uniqid(),
        'sale_price'     => 20.00,
        'cost_price'     => 10.00,
        'stock_quantity' => 100,
        'is_active'      => true,
        ...$attrs,
    ]);
}

test('valuation summary returns total value', function () {
    createInventoryProduct(['cost_price' => 10.00, 'stock_quantity' => 50]);
    createInventoryProduct(['cost_price' => 20.00, 'stock_quantity' => 25]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/inventory-valuation/summary')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['total_value', 'product_count', 'valuation_method', 'as_of']]);

    expect((float) $response->json('data.total_value'))->toBe(1000.0);
    expect($response->json('data.product_count'))->toBe(2);
});

test('valuation breakdown lists products with margin', function () {
    createInventoryProduct(['cost_price' => 5.00, 'sale_price' => 10.00, 'stock_quantity' => 100]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/inventory-valuation/breakdown')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['products', 'total_cost_value', 'total_retail_value', 'count']]);

    expect($response->json('data.count'))->toBe(1);
    expect((float) $response->json('data.products.0.stock_value'))->toBe(500.0);
    expect((float) $response->json('data.products.0.potential_margin'))->toBe(50.0);
});

test('breakdown min_value filter excludes low value products', function () {
    createInventoryProduct(['cost_price' => 1.00, 'stock_quantity' => 5]);   // value = 5
    createInventoryProduct(['cost_price' => 10.00, 'stock_quantity' => 50]); // value = 500

    $data = $this->withToken($this->token)
        ->getJson('/api/v1/inventory-valuation/breakdown?min_value=100')
        ->assertStatus(200)
        ->json('data');

    expect($data['count'])->toBe(1);
    expect((float) $data['products'][0]['stock_value'])->toBeGreaterThanOrEqual(100);
});

test('breakdown returns products sorted by descending stock value', function () {
    createInventoryProduct(['cost_price' => 5.00, 'stock_quantity' => 10]);  // value = 50
    createInventoryProduct(['cost_price' => 50.00, 'stock_quantity' => 10]); // value = 500

    $data = $this->withToken($this->token)
        ->getJson('/api/v1/inventory-valuation/breakdown')
        ->assertStatus(200)
        ->json('data');

    expect((float) $data['products'][0]['stock_value'])->toBeGreaterThan((float) $data['products'][1]['stock_value']);
});

test('movement summary returns movement type breakdown', function () {
    $response = $this->withToken($this->token)
        ->getJson('/api/v1/inventory-valuation/movement')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['period', 'movements']]);

    expect($response->json('data.period'))->toHaveKey('from');
    expect($response->json('data.period'))->toHaveKey('to');
});

test('low value stock endpoint filters by threshold', function () {
    createInventoryProduct(['cost_price' => 1.00, 'stock_quantity' => 5]);   // value = 5
    createInventoryProduct(['cost_price' => 50.00, 'stock_quantity' => 100]); // value = 5000

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/inventory-valuation/low-value?threshold=50')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['threshold', 'products', 'count']]);

    expect($response->json('data.count'))->toBe(1);
    expect((float) $response->json('data.products.0.stock_value'))->toBeLessThanOrEqual(50);
});

test('no stock products are excluded from valuation', function () {
    createInventoryProduct(['stock_quantity' => 0]);
    createInventoryProduct(['stock_quantity' => 10, 'cost_price' => 5.00]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/inventory-valuation/summary')
        ->assertStatus(200);

    expect($response->json('data.product_count'))->toBe(1);
});

test('total retail value is calculated from sale_price', function () {
    createInventoryProduct(['cost_price' => 5.00, 'sale_price' => 15.00, 'stock_quantity' => 10]);

    $data = $this->withToken($this->token)
        ->getJson('/api/v1/inventory-valuation/breakdown')
        ->assertStatus(200)
        ->json('data');

    expect((float) $data['total_retail_value'])->toBe(150.0);
    expect((float) $data['total_cost_value'])->toBe(50.0);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/inventory-valuation/summary')->assertStatus(401);
});

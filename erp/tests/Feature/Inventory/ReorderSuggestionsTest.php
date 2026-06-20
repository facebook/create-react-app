<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Reorder Co', 'slug' => 'reorder-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('suggestions returns products below reorder point', function () {
    Product::create([
        'tenant_id'      => $this->tenant->id,
        'sku'            => 'SKU-LOW-' . uniqid(),
        'name'           => 'Low Stock Item',
        'cost_price'     => 10,
        'sale_price'     => 20,
        'stock_quantity' => 2,
        'reorder_point'  => 10,
        'reorder_quantity' => 50,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/reorder/suggestions')
        ->assertStatus(200);

    $data = $response->json('data');
    expect($data['total_items'])->toBeGreaterThan(0);
    expect($data['suggestions'])->not->toBeEmpty();
    expect($data['suggestions'][0]['name'])->toBe('Low Stock Item');
});

test('suggestion includes urgency level', function () {
    Product::create([
        'tenant_id'      => $this->tenant->id,
        'sku'            => 'SKU-OUT-' . uniqid(),
        'name'           => 'Out Of Stock',
        'cost_price'     => 5,
        'sale_price'     => 15,
        'stock_quantity' => 0,
        'reorder_point'  => 20,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/reorder/suggestions')
        ->assertStatus(200);

    $suggestion = collect($response->json('data.suggestions'))
        ->firstWhere('name', 'Out Of Stock');

    expect($suggestion['urgency'])->toBe('critical');
    expect($suggestion['current_stock'])->toBe(0);
});

test('products above threshold are excluded', function () {
    Product::create([
        'tenant_id'      => $this->tenant->id,
        'sku'            => 'SKU-FULL-' . uniqid(),
        'name'           => 'Well Stocked',
        'cost_price'     => 10,
        'sale_price'     => 20,
        'stock_quantity' => 100,
        'reorder_point'  => 10,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/reorder/suggestions')
        ->assertStatus(200);

    $names = collect($response->json('data.suggestions'))->pluck('name');
    expect($names)->not->toContain('Well Stocked');
});

test('suggestion calculates deficit correctly', function () {
    Product::create([
        'tenant_id'      => $this->tenant->id,
        'sku'            => 'SKU-DEF-' . uniqid(),
        'name'           => 'Deficit Item',
        'cost_price'     => 10,
        'sale_price'     => 20,
        'stock_quantity' => 3,
        'reorder_point'  => 15,
        'reorder_quantity' => 25,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/reorder/suggestions')
        ->assertStatus(200);

    $suggestion = collect($response->json('data.suggestions'))
        ->firstWhere('name', 'Deficit Item');

    expect($suggestion['deficit'])->toBe(12);
    expect($suggestion['suggested_qty'])->toBe(25);
});

test('summary returns stock health metrics', function () {
    Product::create([
        'tenant_id'      => $this->tenant->id,
        'sku'            => 'SKU-SUM-1-' . uniqid(),
        'name'           => 'Healthy Product',
        'cost_price'     => 10,
        'sale_price'     => 20,
        'stock_quantity' => 50,
        'reorder_point'  => 10,
    ]);

    Product::create([
        'tenant_id'      => $this->tenant->id,
        'sku'            => 'SKU-SUM-2-' . uniqid(),
        'name'           => 'Low Product',
        'cost_price'     => 10,
        'sale_price'     => 20,
        'stock_quantity' => 2,
        'reorder_point'  => 10,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/reorder/summary')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['total_products', 'low_stock_count', 'out_of_stock', 'healthy_stock']]);

    expect($response->json('data.total_products'))->toBeGreaterThanOrEqual(2);
});

test('products without reorder point not included', function () {
    Product::create([
        'tenant_id'      => $this->tenant->id,
        'sku'            => 'SKU-NRP-' . uniqid(),
        'name'           => 'No Reorder Point',
        'cost_price'     => 10,
        'sale_price'     => 20,
        'stock_quantity' => 0,
        'reorder_point'  => 0,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/reorder/suggestions')
        ->assertStatus(200);

    $names = collect($response->json('data.suggestions'))->pluck('name');
    expect($names)->not->toContain('No Reorder Point');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/reorder/suggestions')->assertStatus(401);
});

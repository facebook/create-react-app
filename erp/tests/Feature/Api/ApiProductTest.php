<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'API Co', 'slug' => 'api-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('unauthorized requests are rejected from product list', function () {
    $this->getJson('/api/v1/products')->assertStatus(401);
});

test('list products returns paginated data', function () {
    Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Test Product',
        'sku'        => 'SKU-001',
        'sale_price' => 100,
        'cost_price' => 60,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/products');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'success',
                 'data',
                 'meta' => ['total', 'per_page', 'current_page', 'last_page'],
             ])
             ->assertJson(['success' => true]);
});

test('create product works', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/products', [
        'name'        => 'New Product',
        'sku'         => 'SKU-NEW-001',
        'sale_price'  => 150,
        'cost_price'  => 80,
    ]);

    $response->assertStatus(201)
             ->assertJson(['success' => true])
             ->assertJsonPath('data.name', 'New Product')
             ->assertJsonPath('data.sku', 'SKU-NEW-001');

    $this->assertDatabaseHas('products', ['sku' => 'SKU-NEW-001']);
});

test('create product requires name, sku, sale_price, cost_price', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/products', [
        'name' => 'Incomplete',
    ]);

    $response->assertStatus(422);
});

test('get single product', function () {
    $product = Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Single Product',
        'sku'        => 'SKU-002',
        'sale_price' => 200,
        'cost_price' => 100,
    ]);

    $response = $this->withToken($this->token)->getJson("/api/v1/products/{$product->id}");

    $response->assertStatus(200)
             ->assertJsonPath('data.id', $product->id)
             ->assertJsonPath('data.name', 'Single Product');
});

test('update product', function () {
    $product = Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Update Me',
        'sku'        => 'SKU-003',
        'sale_price' => 100,
        'cost_price' => 50,
    ]);

    $response = $this->withToken($this->token)->putJson("/api/v1/products/{$product->id}", [
        'name'       => 'Updated Name',
        'sale_price' => 120,
    ]);

    $response->assertStatus(200)
             ->assertJsonPath('data.name', 'Updated Name');

    $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Updated Name']);
});

test('delete product', function () {
    $product = Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Delete Me',
        'sku'        => 'SKU-DEL',
        'sale_price' => 10,
        'cost_price' => 5,
    ]);

    $response = $this->withToken($this->token)->deleteJson("/api/v1/products/{$product->id}");

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    $this->assertSoftDeleted('products', ['id' => $product->id]);
});

test('search filter returns matching products', function () {
    Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Alpha Widget',
        'sku'        => 'AW-001',
        'sale_price' => 50,
        'cost_price' => 25,
    ]);
    Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Beta Gadget',
        'sku'        => 'BG-001',
        'sale_price' => 75,
        'cost_price' => 40,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/products?search=Alpha');

    $response->assertStatus(200);
    $data = $response->json('data');
    expect(count($data))->toBe(1)
        ->and($data[0]['name'])->toBe('Alpha Widget');
});

test('get non-existent product returns 404', function () {
    $this->withToken($this->token)->getJson('/api/v1/products/99999')
         ->assertStatus(404);
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductAttribute;
use App\Modules\Inventory\Models\ProductVariant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Variant API Co', 'slug' => 'variant-api-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);

    $this->product = Product::create([
        'tenant_id'  => $this->tenant->id,
        'sku'        => 'PROD-VAPI-' . uniqid(),
        'name'       => 'T-Shirt',
        'sale_price' => 25.00,
        'cost_price' => 10.00,
    ]);
});

test('can list product attributes via api', function () {
    ProductAttribute::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Color',
        'type'      => 'select',
        'options'   => ['Red', 'Blue', 'Green'],
    ]);

    $this->withToken($this->token)
        ->getJson('/api/v1/product-attributes')
        ->assertStatus(200)
        ->assertJsonPath('data.0.name', 'Color');
});

test('can create a product attribute via api', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/product-attributes', [
            'name'    => 'Size',
            'type'    => 'select',
            'options' => ['S', 'M', 'L', 'XL'],
        ])
        ->assertStatus(201);

    expect(ProductAttribute::where('name', 'Size')->exists())->toBeTrue();
});

test('attribute type validation', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/product-attributes', [
            'name' => 'Invalid',
            'type' => 'unknown',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['type']);
});

test('can update a product attribute via api', function () {
    $attr = ProductAttribute::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Material',
        'type'      => 'text',
    ]);

    $this->withToken($this->token)
        ->putJson("/api/v1/product-attributes/{$attr->id}", ['name' => 'Fabric'])
        ->assertStatus(200)
        ->assertJsonPath('data.name', 'Fabric');
});

test('can delete a product attribute via api', function () {
    $attr = ProductAttribute::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Delete Me',
        'type'      => 'text',
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/product-attributes/{$attr->id}")
        ->assertStatus(200);

    expect(ProductAttribute::find($attr->id))->toBeNull();
});

test('can list variants for a product via api', function () {
    ProductVariant::create([
        'tenant_id'  => $this->tenant->id,
        'product_id' => $this->product->id,
        'sku'        => 'TSH-RED-M-' . uniqid(),
        'name'       => 'Red / M',
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/products/{$this->product->id}/variants")
        ->assertStatus(200)
        ->assertJsonPath('data.0.name', 'Red / M');
});

test('can create a variant with attributes via api', function () {
    $attr = ProductAttribute::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Color',
        'type'      => 'select',
        'options'   => ['Red', 'Blue'],
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/products/{$this->product->id}/variants", [
            'name'             => 'Blue / L',
            'sku'              => 'TSH-BLUE-L-' . uniqid(),
            'price_adjustment' => 2.50,
            'stock_quantity'   => 100,
            'attributes'       => [
                ['attribute_id' => $attr->id, 'value' => 'Blue'],
            ],
        ])
        ->assertStatus(201);

    expect(ProductVariant::where('name', 'Blue / L')->exists())->toBeTrue();
});

test('can update a variant via api', function () {
    $variant = ProductVariant::create([
        'tenant_id'  => $this->tenant->id,
        'product_id' => $this->product->id,
        'sku'        => 'TSH-UPD-' . uniqid(),
        'name'       => 'Old Name',
    ]);

    $this->withToken($this->token)
        ->putJson("/api/v1/products/{$this->product->id}/variants/{$variant->id}", [
            'stock_quantity' => 50,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.stock_quantity', 50);
});

test('can delete a variant via api', function () {
    $variant = ProductVariant::create([
        'tenant_id'  => $this->tenant->id,
        'product_id' => $this->product->id,
        'sku'        => 'TSH-DEL-' . uniqid(),
        'name'       => 'To Delete',
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/products/{$this->product->id}/variants/{$variant->id}")
        ->assertStatus(200);

    expect(ProductVariant::withTrashed()->find($variant->id)?->deleted_at)->not->toBeNull();
});

test('matrix endpoint returns product variant grid', function () {
    ProductVariant::create([
        'tenant_id'  => $this->tenant->id,
        'product_id' => $this->product->id,
        'sku'        => 'TSH-MAT-' . uniqid(),
        'name'       => 'Green / S',
        'is_active'  => true,
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/products/{$this->product->id}/matrix")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['product', 'attributes', 'variants']]);
});

test('requires authentication for variants', function () {
    $this->getJson("/api/v1/products/{$this->product->id}/variants")->assertStatus(401);
});

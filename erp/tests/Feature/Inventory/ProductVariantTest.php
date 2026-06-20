<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductAttribute;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\ProductVariant;
use App\Modules\Inventory\Models\ProductVariantValue;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Variant Co', 'slug' => 'variant-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeVariantProduct(): Product
{
    $cat = ProductCategory::create(['tenant_id' => test()->tenant->id, 'name' => 'Var Cat', 'colour' => '#000']);
    return Product::create([
        'tenant_id'     => test()->tenant->id,
        'sku'           => 'VPROD-' . uniqid(),
        'name'          => 'Variable Product',
        'cost_price'    => 10,
        'sale_price'    => 20,
        'reorder_point' => 5,
        'category_id'   => $cat->id,
        'is_active'     => true,
    ]);
}

function makeAttribute(string $name = 'Size', string $type = 'select', array $options = ['S', 'M', 'L']): ProductAttribute
{
    return ProductAttribute::create([
        'tenant_id' => test()->tenant->id,
        'name'      => $name,
        'type'      => $type,
        'options'   => $options,
    ]);
}

function makeVariant(Product $product, string $suffix = ''): ProductVariant
{
    return ProductVariant::create([
        'tenant_id'        => test()->tenant->id,
        'product_id'       => $product->id,
        'sku'              => 'VAR-' . uniqid() . $suffix,
        'name'             => 'Red / Large',
        'price_adjustment' => 5.00,
        'stock_quantity'   => 10,
        'is_active'        => true,
    ]);
}

it('admin can list product attributes', function () {
    $this->get('/inventory/product-attributes')->assertStatus(200);
});

it('admin can create a product attribute', function () {
    $this->post('/inventory/product-attributes', [
        'name'    => 'Color',
        'type'    => 'select',
        'options' => ['Red', 'Blue', 'Green'],
    ])->assertRedirect();
    expect(ProductAttribute::where('name', 'Color')->exists())->toBeTrue();
});

it('attribute store validates required name', function () {
    $this->postJson('/inventory/product-attributes', ['name' => '', 'type' => 'select'])
        ->assertStatus(422)->assertJsonValidationErrors(['name']);
});

it('admin can list product variants', function () {
    $this->get('/inventory/product-variants')->assertStatus(200);
});

it('admin can create a product variant', function () {
    $product = makeVariantProduct();
    $attr    = makeAttribute();
    $sku     = 'VAR-TEST-' . uniqid();
    $this->post('/inventory/product-variants', [
        'product_id'       => $product->id,
        'sku'              => $sku,
        'name'             => 'Large',
        'price_adjustment' => 2.50,
        'stock_quantity'   => 5,
        'values'           => [['attribute_id' => $attr->id, 'value' => 'L']],
    ])->assertRedirect();
    $variant = ProductVariant::where('sku', $sku)->first();
    expect($variant)->not->toBeNull();
    expect($variant->values()->count())->toBe(1);
});

it('variant store requires unique sku', function () {
    $product = makeVariantProduct();
    $variant = makeVariant($product);
    $this->postJson('/inventory/product-variants', [
        'product_id'       => $product->id,
        'sku'              => $variant->sku,
        'name'             => 'Duplicate',
        'price_adjustment' => 0,
        'stock_quantity'   => 1,
    ])->assertStatus(422)->assertJsonValidationErrors(['sku']);
});

it('admin can view a product variant', function () {
    $product = makeVariantProduct();
    $variant = makeVariant($product);
    $this->get("/inventory/product-variants/{$variant->id}")->assertStatus(200);
});

it('admin can adjust stock', function () {
    $product = makeVariantProduct();
    $variant = makeVariant($product);
    $this->patch("/inventory/product-variants/{$variant->id}/adjust-stock", ['delta' => 5])->assertRedirect();
    expect($variant->fresh()->stock_quantity)->toBe(15);
});

it('stock cannot go below zero', function () {
    $product = makeVariantProduct();
    $variant = makeVariant($product);
    $this->patch("/inventory/product-variants/{$variant->id}/adjust-stock", ['delta' => -100])->assertRedirect();
    expect($variant->fresh()->stock_quantity)->toBe(0);
});

it('effective_price accessor adds price_adjustment to sale_price', function () {
    $product = makeVariantProduct();
    $variant = makeVariant($product);
    $variant->load('product');
    expect($variant->effective_price)->toBe(25.0);
});

it('staff cannot delete a variant', function () {
    $product = makeVariantProduct();
    $variant = makeVariant($product);
    $this->actingAs($this->staff)
        ->delete("/inventory/product-variants/{$variant->id}")
        ->assertStatus(403);
});

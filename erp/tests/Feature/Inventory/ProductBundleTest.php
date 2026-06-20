<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductBundle;
use App\Modules\Inventory\Models\ProductBundleItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'BundleCorp', 'slug' => 'bundle-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePBundleProduct(): Product
{
    return Product::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Bundle Prod ' . uniqid(),
        'sku'       => 'BP-' . strtoupper(substr(uniqid(), -6)),
        'type'      => 'product',
        'status'    => 'active',
    ]);
}

function makeProductBundle(array $attrs = []): ProductBundle
{
    return ProductBundle::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Bundle ' . uniqid(),
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/product-bundles')->assertRedirect('/login');
});

it('admin can list product bundles', function () {
    makeProductBundle();
    $this->get('/inventory/product-bundles')->assertOk();
});

it('store creates a product bundle', function () {
    $this->post('/inventory/product-bundles', [
        'name'         => 'Starter Kit',
        'sku'          => 'SK-001',
        'bundle_price' => 99.99,
    ])->assertRedirect();

    expect(ProductBundle::where('name', 'Starter Kit')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/product-bundles', [])->assertStatus(422)->assertJsonValidationErrors(['name']);
});

it('show displays a bundle', function () {
    $bundle = makeProductBundle();
    $this->get("/inventory/product-bundles/{$bundle->id}")->assertOk();
});

it('addItem adds a product to the bundle', function () {
    $bundle  = makeProductBundle();
    $product = makePBundleProduct();

    $this->post("/inventory/product-bundles/{$bundle->id}/items", [
        'product_id' => $product->id,
        'quantity'   => 2,
    ])->assertRedirect();

    expect(ProductBundleItem::where('product_bundle_id', $bundle->id)->where('product_id', $product->id)->exists())->toBeTrue();
});

it('removeItem removes a product from the bundle', function () {
    $bundle  = makeProductBundle();
    $product = makePBundleProduct();

    $item = ProductBundleItem::create([
        'tenant_id'         => test()->tenant->id,
        'product_bundle_id' => $bundle->id,
        'product_id'        => $product->id,
        'quantity'          => 1,
    ]);

    $this->delete("/inventory/product-bundles/{$bundle->id}/items/{$item->id}")->assertRedirect();

    expect(ProductBundleItem::find($item->id))->toBeNull();
});

it('item_count accessor returns correct count', function () {
    $bundle  = makeProductBundle();
    $product = makePBundleProduct();

    ProductBundleItem::create([
        'tenant_id'         => test()->tenant->id,
        'product_bundle_id' => $bundle->id,
        'product_id'        => $product->id,
        'quantity'          => 1,
    ]);

    expect($bundle->item_count)->toBe(1);
});

it('destroy soft-deletes the bundle', function () {
    $bundle = makeProductBundle();
    $this->delete("/inventory/product-bundles/{$bundle->id}")->assertRedirect();
    expect(ProductBundle::find($bundle->id))->toBeNull();
    expect(ProductBundle::withTrashed()->find($bundle->id))->not->toBeNull();
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductBundle;
use App\Modules\Inventory\Models\ProductBundleItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Bundle Co', 'slug' => 'bundle-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeBundleProduct(?string $name = null, float $price = 50.0): Product
{
    return Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => $name ?? 'Bundle Item ' . uniqid(),
        'sku'        => 'BND-' . uniqid(),
        'sale_price' => $price,
        'cost_price' => $price * 0.6,
        'is_active'  => true,
    ]);
}

test('can create a product bundle', function () {
    $p1 = makeBundleProduct('Widget', 30.0);
    $p2 = makeBundleProduct('Gadget', 20.0);

    $this->withToken($this->token)
        ->postJson('/api/v1/product-bundles', [
            'name'  => 'Starter Kit',
            'sku'   => 'KIT-001',
            'items' => [
                ['product_id' => $p1->id, 'quantity' => 2],
                ['product_id' => $p2->id, 'quantity' => 1],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Starter Kit');
});

test('can list product bundles', function () {
    $p = makeBundleProduct();
    $bundle = ProductBundle::create(['tenant_id' => $this->tenant->id, 'name' => 'Test Bundle', 'is_active' => true]);
    ProductBundleItem::create(['tenant_id' => $this->tenant->id, 'product_bundle_id' => $bundle->id, 'product_id' => $p->id, 'quantity' => 1]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/product-bundles')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can view a bundle with items and calculated price', function () {
    $p = makeBundleProduct('Item', 100.0);
    $bundle = ProductBundle::create(['tenant_id' => $this->tenant->id, 'name' => 'My Bundle']);
    ProductBundleItem::create(['tenant_id' => $this->tenant->id, 'product_bundle_id' => $bundle->id, 'product_id' => $p->id, 'quantity' => 2]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/product-bundles/{$bundle->id}")
        ->assertStatus(200);

    expect((float) $response->json('data.calculated_price'))->toBe(200.0);
});

test('fixed bundle price overrides calculated price', function () {
    $p = makeBundleProduct('Expensive Item', 100.0);
    $bundle = ProductBundle::create(['tenant_id' => $this->tenant->id, 'name' => 'Discounted Bundle', 'bundle_price' => 79.99]);
    ProductBundleItem::create(['tenant_id' => $this->tenant->id, 'product_bundle_id' => $bundle->id, 'product_id' => $p->id, 'quantity' => 1]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/product-bundles/{$bundle->id}/price")
        ->assertStatus(200);

    expect((float) $response->json('data.calculated_price'))->toBe(79.99);
    expect($response->json('data.has_fixed_price'))->toBeTrue();
    expect((float) $response->json('data.savings'))->toBe(20.01);
});

test('can update a bundle', function () {
    $bundle = ProductBundle::create(['tenant_id' => $this->tenant->id, 'name' => 'Old Name']);

    $this->withToken($this->token)
        ->putJson("/api/v1/product-bundles/{$bundle->id}", ['name' => 'New Name', 'bundle_price' => 99.99])
        ->assertStatus(200)
        ->assertJsonPath('data.name', 'New Name');
});

test('can add an item to a bundle', function () {
    $bundle = ProductBundle::create(['tenant_id' => $this->tenant->id, 'name' => 'Growing Bundle']);
    $p      = makeBundleProduct();

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/product-bundles/{$bundle->id}/items", [
            'product_id' => $p->id,
            'quantity'   => 3,
        ])
        ->assertStatus(201);

    expect((float) $response->json('data.quantity'))->toBe(3.0);
});

test('can remove an item from a bundle', function () {
    $p      = makeBundleProduct();
    $bundle = ProductBundle::create(['tenant_id' => $this->tenant->id, 'name' => 'Shrinking Bundle']);
    $item   = ProductBundleItem::create(['tenant_id' => $this->tenant->id, 'product_bundle_id' => $bundle->id, 'product_id' => $p->id, 'quantity' => 1]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/product-bundles/{$bundle->id}/items/{$item->id}")
        ->assertStatus(200);

    expect(ProductBundleItem::find($item->id))->toBeNull();
});

test('can soft delete a bundle', function () {
    $bundle = ProductBundle::create(['tenant_id' => $this->tenant->id, 'name' => 'Delete Me']);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/product-bundles/{$bundle->id}")
        ->assertStatus(200);

    expect(ProductBundle::withTrashed()->find($bundle->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/product-bundles')->assertStatus(401);
});

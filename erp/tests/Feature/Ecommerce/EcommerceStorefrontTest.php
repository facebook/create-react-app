<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Ecommerce\Models\StoreCoupon;
use App\Modules\Ecommerce\Models\StoreProduct;
use App\Modules\Ecommerce\Models\StoreReview;
use App\Modules\Ecommerce\Models\StoreSettings;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Storefront Co', 'slug' => 'storefront-co-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->store = StoreSettings::create([
        'tenant_id'    => $this->tenant->id,
        'store_name'   => 'Test Shop',
        'store_slug'   => 'test-shop-' . uniqid(),
        'currency_code' => 'USD',
        'is_active'    => true,
    ]);

    $inventoryProduct = Product::create([
        'tenant_id'  => $this->tenant->id,
        'sku'        => 'TEST-' . uniqid(),
        'name'       => 'Test Product',
        'cost_price' => 10.00,
        'sale_price' => 20.00,
        'is_active'  => true,
        'is_bundle'  => false,
    ]);

    $this->storeProduct = StoreProduct::create([
        'tenant_id'   => $this->tenant->id,
        'product_id'  => $inventoryProduct->id,
        'store_price' => 25.00,
        'is_featured' => true,
        'is_visible'  => true,
        'sort_order'  => 0,
    ]);
});

test('views cart', function () {
    $this->get("/store/{$this->store->store_slug}/cart")
        ->assertStatus(200);
});

test('adds item to cart', function () {
    $this->post("/store/{$this->store->store_slug}/cart", [
        'store_product_id' => $this->storeProduct->id,
        'quantity'         => 2,
    ])->assertRedirect();

    $this->assertDatabaseHas('store_carts', [
        'store_product_id' => $this->storeProduct->id,
        'quantity'         => 2,
    ]);
});

test('updates cart quantity', function () {
    $this->post("/store/{$this->store->store_slug}/cart", [
        'store_product_id' => $this->storeProduct->id,
        'quantity'         => 1,
    ]);

    $cartItem = \App\Modules\Ecommerce\Models\StoreCart::where('store_product_id', $this->storeProduct->id)->first();

    $this->patch("/store/{$this->store->store_slug}/cart/{$cartItem->id}", [
        'quantity' => 5,
    ])->assertRedirect();

    expect($cartItem->fresh()->quantity)->toBe(5);
});

test('removes cart item', function () {
    $this->post("/store/{$this->store->store_slug}/cart", [
        'store_product_id' => $this->storeProduct->id,
        'quantity'         => 1,
    ]);

    $cartItem = \App\Modules\Ecommerce\Models\StoreCart::where('store_product_id', $this->storeProduct->id)->first();

    $this->delete("/store/{$this->store->store_slug}/cart/{$cartItem->id}")
        ->assertRedirect();

    expect(\App\Modules\Ecommerce\Models\StoreCart::find($cartItem->id))->toBeNull();
});

test('validates coupon and returns valid true', function () {
    StoreCoupon::create([
        'tenant_id'  => $this->tenant->id,
        'code'       => 'SAVE10',
        'type'       => 'percentage',
        'value'      => 10,
        'is_active'  => true,
        'uses_count' => 0,
    ]);

    $this->postJson("/store/{$this->store->store_slug}/coupon/validate", [
        'code'     => 'SAVE10',
        'subtotal' => 100,
    ])->assertJson(['valid' => true]);
});

test('rejects invalid coupon', function () {
    StoreCoupon::create([
        'tenant_id'   => $this->tenant->id,
        'code'        => 'EXPIRED',
        'type'        => 'percentage',
        'value'       => 10,
        'is_active'   => true,
        'valid_until' => now()->subDay()->toDateString(),
        'uses_count'  => 0,
    ]);

    $this->postJson("/store/{$this->store->store_slug}/coupon/validate", [
        'code'     => 'EXPIRED',
        'subtotal' => 100,
    ])->assertJson(['valid' => false]);
});

test('submits a review with is_approved false', function () {
    $this->post("/store/{$this->store->store_slug}/products/{$this->storeProduct->id}/reviews", [
        'reviewer_name' => 'John Doe',
        'rating'        => 5,
        'title'         => 'Great product',
        'body'          => 'Loved it!',
    ])->assertRedirect();

    $this->assertDatabaseHas('store_reviews', [
        'store_product_id' => $this->storeProduct->id,
        'reviewer_name'    => 'John Doe',
        'rating'           => 5,
        'is_approved'      => false,
    ]);
});

test('lists admin reviews', function () {
    $this->get('/ecommerce/reviews')
        ->assertStatus(200);
});

test('approves a review', function () {
    $review = StoreReview::create([
        'tenant_id'        => $this->tenant->id,
        'store_product_id' => $this->storeProduct->id,
        'reviewer_name'    => 'Jane',
        'rating'           => 4,
        'is_approved'      => false,
    ]);

    $this->post("/ecommerce/reviews/{$review->id}/approve")
        ->assertRedirect();

    expect($review->fresh()->is_approved)->toBeTrue();
});

test('creates a coupon', function () {
    $this->post('/ecommerce/coupons', [
        'code'  => 'NEWCODE',
        'type'  => 'fixed',
        'value' => 5.00,
    ])->assertRedirect();

    $this->assertDatabaseHas('store_coupons', [
        'tenant_id' => $this->tenant->id,
        'code'      => 'NEWCODE',
    ]);
});

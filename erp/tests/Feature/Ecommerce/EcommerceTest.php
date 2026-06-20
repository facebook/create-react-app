<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Ecommerce\Models\StoreCategory;
use App\Modules\Ecommerce\Models\StoreOrder;
use App\Modules\Ecommerce\Models\StoreOrderItem;
use App\Modules\Ecommerce\Models\StoreProduct;
use App\Modules\Ecommerce\Models\StoreSettings;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Ecommerce Co', 'slug' => 'ecommerce-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStore(): StoreSettings
{
    return StoreSettings::create([
        'tenant_id'            => app('tenant')->id,
        'store_name'           => 'Test Store',
        'store_slug'           => 'test-store',
        'currency_code'        => 'USD',
        'is_active'            => true,
        'primary_color'        => '#4f46e5',
        'allow_guest_checkout' => true,
    ]);
}

function makeCategory(): StoreCategory
{
    return StoreCategory::create([
        'tenant_id'  => app('tenant')->id,
        'name'       => 'Test Category',
        'slug'       => 'test-category',
        'is_active'  => true,
        'sort_order' => 0,
    ]);
}

function makeInventoryProduct(): Product
{
    return Product::create([
        'tenant_id'   => app('tenant')->id,
        'sku'         => 'TEST-' . rand(1000, 9999),
        'name'        => 'Test Product',
        'cost_price'  => 10.00,
        'sale_price'  => 20.00,
        'is_active'   => true,
        'is_bundle'   => false,
    ]);
}

function makeStoreProduct(): StoreProduct
{
    $product = makeInventoryProduct();
    return StoreProduct::create([
        'tenant_id'   => app('tenant')->id,
        'product_id'  => $product->id,
        'store_price' => 25.00,
        'is_featured' => true,
        'is_visible'  => true,
        'sort_order'  => 0,
    ]);
}

function makeOrder(): StoreOrder
{
    $order = StoreOrder::create([
        'tenant_id'      => app('tenant')->id,
        'status'         => 'pending',
        'customer_name'  => 'John Doe',
        'customer_email' => 'john@example.com',
        'subtotal'       => 50.00,
        'total'          => 50.00,
        'payment_status' => 'pending',
    ]);
    $order->order_number = $order->generateOrderNumber();
    $order->save();
    return $order;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

test('ecommerce dashboard renders', function () {
    $this->get('/ecommerce/dashboard')->assertStatus(200);
});

// ─── Settings ─────────────────────────────────────────────────────────────────

test('settings show creates default if none exists', function () {
    $this->get('/ecommerce/settings')->assertStatus(200);
    expect(StoreSettings::where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('settings can be updated', function () {
    makeStore();
    $this->put('/ecommerce/settings', [
        'store_name'           => 'Updated Store',
        'store_slug'           => 'updated-store',
        'currency_code'        => 'EUR',
        'is_active'            => true,
        'allow_guest_checkout' => false,
        'primary_color'        => '#ff0000',
    ])->assertRedirect();

    expect(StoreSettings::where('tenant_id', $this->tenant->id)->first()->store_name)->toBe('Updated Store');
});

// ─── Categories ───────────────────────────────────────────────────────────────

test('categories index renders', function () {
    $this->get('/ecommerce/categories')->assertStatus(200);
});

test('can create a category', function () {
    $this->post('/ecommerce/categories', [
        'name'       => 'Electronics',
        'is_active'  => true,
        'sort_order' => 0,
    ])->assertRedirect();

    expect(StoreCategory::where('tenant_id', $this->tenant->id)->where('name', 'Electronics')->exists())->toBeTrue();
});

test('can update a category', function () {
    $cat = makeCategory();
    $this->put("/ecommerce/categories/{$cat->id}", [
        'name'      => 'Updated Category',
        'is_active' => false,
    ])->assertRedirect();

    expect($cat->fresh()->name)->toBe('Updated Category');
});

test('can delete a category', function () {
    $cat = makeCategory();
    $this->delete("/ecommerce/categories/{$cat->id}")->assertRedirect();
    expect(StoreCategory::find($cat->id))->toBeNull();
});

// ─── Store Products ───────────────────────────────────────────────────────────

test('store products index renders', function () {
    $this->get('/ecommerce/products')->assertStatus(200);
});

test('store products create page renders', function () {
    $this->get('/ecommerce/products/create')->assertStatus(200);
});

test('can create a store product', function () {
    $product = makeInventoryProduct();
    $this->post('/ecommerce/products', [
        'product_id'  => $product->id,
        'store_price' => 29.99,
        'is_featured' => true,
        'is_visible'  => true,
        'sort_order'  => 0,
    ])->assertRedirect('/ecommerce/products');

    expect(StoreProduct::where('tenant_id', $this->tenant->id)->where('product_id', $product->id)->exists())->toBeTrue();
});

test('store product edit page renders', function () {
    $sp = makeStoreProduct();
    $this->get("/ecommerce/products/{$sp->id}/edit")->assertStatus(200);
});

test('can update a store product', function () {
    $sp = makeStoreProduct();
    $this->put("/ecommerce/products/{$sp->id}", [
        'store_price' => 39.99,
        'is_featured' => false,
        'is_visible'  => true,
        'sort_order'  => 1,
    ])->assertRedirect('/ecommerce/products');

    expect((float) $sp->fresh()->store_price)->toBe(39.99);
});

test('can destroy a store product', function () {
    $sp = makeStoreProduct();
    $this->delete("/ecommerce/products/{$sp->id}")->assertRedirect('/ecommerce/products');
    expect(StoreProduct::find($sp->id))->toBeNull();
});

// ─── Orders ───────────────────────────────────────────────────────────────────

test('orders index renders', function () {
    $this->get('/ecommerce/orders')->assertStatus(200);
});

test('orders show renders', function () {
    $order = makeOrder();
    $this->get("/ecommerce/orders/{$order->id}")->assertStatus(200);
});

test('can confirm an order', function () {
    $order = makeOrder();
    $this->post("/ecommerce/orders/{$order->id}/confirm")->assertRedirect();
    expect($order->fresh()->status)->toBe('confirmed');
});

test('can mark order as paid', function () {
    $order = makeOrder();
    $this->post("/ecommerce/orders/{$order->id}/mark-paid")->assertRedirect();
    expect($order->fresh()->payment_status)->toBe('paid');
});

test('marking paid on pending order also confirms it', function () {
    $order = makeOrder();
    expect($order->status)->toBe('pending');
    $this->post("/ecommerce/orders/{$order->id}/mark-paid")->assertRedirect();
    expect($order->fresh()->status)->toBe('confirmed');
    expect($order->fresh()->payment_status)->toBe('paid');
});

test('can ship an order', function () {
    $order = makeOrder();
    $order->confirm();
    $this->post("/ecommerce/orders/{$order->id}/ship")->assertRedirect();
    expect($order->fresh()->status)->toBe('shipped');
});

test('can deliver an order', function () {
    $order = makeOrder();
    $order->ship();
    $this->post("/ecommerce/orders/{$order->id}/deliver")->assertRedirect();
    expect($order->fresh()->status)->toBe('delivered');
});

test('can cancel an order', function () {
    $order = makeOrder();
    $this->post("/ecommerce/orders/{$order->id}/cancel")->assertRedirect();
    expect($order->fresh()->status)->toBe('cancelled');
});

test('order number is generated in SO-YYYY-NNNNN format', function () {
    $order = makeOrder();
    expect($order->order_number)->toMatch('/^SO-\d{4}-\d{5}$/');
});

// ─── Storefront ───────────────────────────────────────────────────────────────

test('storefront index renders without auth', function () {
    $store = makeStore();
    // Visit as guest
    auth()->logout();
    $this->get("/store/{$store->store_slug}")->assertStatus(200);
});

test('storefront checkout page renders', function () {
    $store = makeStore();
    auth()->logout();
    $this->get("/store/{$store->store_slug}/checkout")->assertStatus(200);
});

test('place order creates a store order', function () {
    $store = makeStore();
    auth()->logout();

    $this->post("/store/{$store->store_slug}/checkout", [
        'customer_name'    => 'Jane Smith',
        'customer_email'   => 'jane@example.com',
        'customer_phone'   => '555-1234',
        'shipping_address' => '123 Main St',
        'billing_address'  => '123 Main St',
        'payment_method'   => 'cash_on_delivery',
        'items'            => [
            [
                'store_product_id' => null,
                'product_name'     => 'Widget',
                'product_sku'      => 'WGT-001',
                'quantity'         => 2,
                'unit_price'       => 15.00,
                'line_total'       => 30.00,
            ],
        ],
    ])->assertStatus(200);

    expect(StoreOrder::where('tenant_id', $store->tenant_id)
        ->where('customer_email', 'jane@example.com')
        ->exists())->toBeTrue();
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Lunch\Models\LunchSupplier;
use App\Modules\Lunch\Models\LunchProduct;
use App\Modules\Lunch\Models\LunchOrder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Lunch Corp', 'slug' => 'lunch-corp-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

function makeLunchSupplier(array $overrides = []): LunchSupplier
{
    return LunchSupplier::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Supplier ' . uniqid(),
        'is_active' => true,
    ], $overrides));
}

function makeLunchProduct(array $overrides = []): LunchProduct
{
    $supplier = makeLunchSupplier();

    return LunchProduct::create(array_merge([
        'tenant_id'         => test()->tenant->id,
        'lunch_supplier_id' => $supplier->id,
        'name'              => 'Product ' . uniqid(),
        'price'             => 10.00,
        'is_available'      => true,
    ], $overrides));
}

function makeLunchOrder(array $overrides = []): LunchOrder
{
    $product = makeLunchProduct();

    return LunchOrder::create(array_merge([
        'tenant_id'        => test()->tenant->id,
        'lunch_product_id' => $product->id,
        'quantity'         => 1,
        'order_date'       => today()->toDateString(),
        'status'           => 'pending',
        'total_price'      => $product->price,
    ], $overrides));
}

// 1. Dashboard renders
it('renders lunch dashboard', function () {
    $this->get(route('lunch.dashboard'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Lunch/Dashboard'));
});

// 2. Suppliers index renders
it('renders suppliers index', function () {
    $this->get(route('lunch.suppliers'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Lunch/Suppliers/Index'));
});

// 3. Can create a supplier
it('can create a supplier', function () {
    $this->post(route('lunch.suppliers.store'), ['name' => 'Fresh Bites'])->assertRedirect();

    expect(LunchSupplier::where('name', 'Fresh Bites')->exists())->toBeTrue();
});

// 4. Products index renders
it('renders products index', function () {
    $this->get(route('lunch.products'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Lunch/Products/Index'));
});

// 5. Can create a product
it('can create a product', function () {
    $supplier = makeLunchSupplier();

    $this->post(route('lunch.products.store'), [
        'lunch_supplier_id' => $supplier->id,
        'name'              => 'Grilled Chicken',
        'price'             => 12.50,
    ])->assertRedirect();

    expect(LunchProduct::where('name', 'Grilled Chicken')->exists())->toBeTrue();
});

// 6. Orders index renders
it('renders orders index', function () {
    $this->get(route('lunch.orders'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Lunch/Orders/Index'));
});

// 7. Can place an order
it('can place an order', function () {
    $product = makeLunchProduct(['price' => 15.00]);

    $this->post(route('lunch.orders.store'), [
        'lunch_product_id' => $product->id,
        'quantity'         => 2,
        'order_date'       => today()->toDateString(),
    ])->assertStatus(200)->assertJson(['success' => true]);

    expect(LunchOrder::where('total_price', 30.00)->exists())->toBeTrue();
});

// 8. Validates quantity max 10
it('validates quantity max 10 when placing order', function () {
    $product = makeLunchProduct();

    $this->withHeaders(['Accept' => 'application/json'])
        ->post(route('lunch.orders.store'), [
            'lunch_product_id' => $product->id,
            'quantity'         => 11,
            'order_date'       => today()->toDateString(),
        ])->assertStatus(422);
});

// 9. Can update order status to confirmed
it('can update order status to confirmed', function () {
    $order = makeLunchOrder(['status' => 'pending']);

    $this->patch(route('lunch.orders.status', $order), ['status' => 'confirmed'])
        ->assertStatus(200)
        ->assertJson(['success' => true]);

    expect($order->fresh()->status)->toBe('confirmed');
});

// 10. Can update order status to delivered
it('can update order status to delivered', function () {
    $order = makeLunchOrder(['status' => 'confirmed']);

    $this->patch(route('lunch.orders.status', $order), ['status' => 'delivered'])
        ->assertStatus(200)
        ->assertJson(['success' => true]);

    expect($order->fresh()->status)->toBe('delivered');
});

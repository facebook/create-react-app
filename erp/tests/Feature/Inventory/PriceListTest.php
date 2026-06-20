<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\CustomerDiscount;
use App\Modules\Inventory\Models\PriceList;
use App\Modules\Inventory\Models\PriceListItem;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Price Corp', 'slug' => 'price-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePLProduct(): Product
{
    $cat = ProductCategory::create(['tenant_id' => test()->tenant->id, 'name' => 'PL Cat', 'colour' => '#000']);
    return Product::create([
        'tenant_id'     => test()->tenant->id,
        'sku'           => 'PLSKU-' . uniqid(),
        'name'          => 'PL Product',
        'cost_price'    => 10,
        'sale_price'    => 20,
        'reorder_point' => 5,
        'category_id'   => $cat->id,
        'is_active'     => true,
    ]);
}

function makePriceList(bool $isDefault = false): PriceList
{
    return PriceList::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Standard Pricing',
        'currency'   => 'USD',
        'is_active'  => true,
        'is_default' => $isDefault,
    ]);
}

it('admin can list price lists', function () {
    $this->get('/inventory/price-lists')->assertStatus(200);
});

it('admin can create a price list', function () {
    $this->post('/inventory/price-lists', [
        'name'     => 'Wholesale',
        'currency' => 'USD',
    ])->assertRedirect();
    expect(PriceList::where('name', 'Wholesale')->exists())->toBeTrue();
});

it('price list store requires name', function () {
    $this->postJson('/inventory/price-lists', [])->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

it('admin can view a price list', function () {
    $pl = makePriceList();
    $this->get("/inventory/price-lists/{$pl->id}")->assertStatus(200);
});

it('admin can add an item to a price list', function () {
    $pl  = makePriceList();
    $product = makePLProduct();
    $this->post("/inventory/price-lists/{$pl->id}/items", [
        'product_id'   => $product->id,
        'price'        => 18.00,
        'min_quantity' => 1,
    ])->assertRedirect();
    expect($pl->items()->count())->toBe(1);
});

it('getPriceForProduct returns correct tier price', function () {
    $pl      = makePriceList();
    $product = makePLProduct();
    PriceListItem::create(['tenant_id' => test()->tenant->id, 'price_list_id' => $pl->id, 'product_id' => $product->id, 'price' => 20.00, 'min_quantity' => 1]);
    PriceListItem::create(['tenant_id' => test()->tenant->id, 'price_list_id' => $pl->id, 'product_id' => $product->id, 'price' => 15.00, 'min_quantity' => 10]);
    expect($pl->getPriceForProduct($product->id, 5))->toBe(20.0);
    expect($pl->getPriceForProduct($product->id, 10))->toBe(15.0);
});

it('is_valid returns true for active price list within date range', function () {
    $pl = makePriceList();
    expect($pl->is_valid)->toBeTrue();
});

it('admin can list customer discounts', function () {
    $this->get('/inventory/customer-discounts')->assertStatus(200);
});

it('admin can create a customer discount', function () {
    $this->post('/inventory/customer-discounts', [
        'discount_type'  => 'percentage',
        'discount_value' => 10,
        'applies_to'     => 'all',
    ])->assertRedirect();
    expect(CustomerDiscount::where('discount_value', 10)->exists())->toBeTrue();
});

it('discount calculate method works for percentage', function () {
    $discount = CustomerDiscount::create([
        'tenant_id'      => test()->tenant->id,
        'discount_type'  => 'percentage',
        'discount_value' => 20,
        'applies_to'     => 'all',
        'is_active'      => true,
    ]);
    expect($discount->calculate(100))->toBe(20.0);
});

it('staff cannot delete a price list', function () {
    $pl = makePriceList();
    $this->actingAs($this->staff)
        ->delete("/inventory/price-lists/{$pl->id}")
        ->assertStatus(403);
});

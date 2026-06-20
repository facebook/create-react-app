<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\PriceList;
use App\Modules\Finance\Models\PriceListItem;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Price Co', 'slug' => 'price-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
});

function makeProduct(): Product
{
    static $counter = 0;
    $counter++;
    return Product::create([
        'tenant_id'   => test()->tenant->id,
        'name'        => 'Widget',
        'sku'         => 'W-' . str_pad($counter, 3, '0', STR_PAD_LEFT),
        'cost_price'  => 5,
        'sale_price'  => 10,
        'is_active'   => true,
    ]);
}

// 1. admin can list price lists
test('admin can list price lists', function () {
    $this->get('/finance/price-lists')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/PriceLists/Index'));
});

// 2. admin can create a price list
test('admin can create a price list', function () {
    $this->post('/finance/price-lists', [
        'name'          => 'VIP Pricing',
        'currency_code' => 'USD',
    ])->assertRedirect();

    expect(PriceList::where('name', 'VIP Pricing')
        ->where('tenant_id', $this->tenant->id)
        ->exists()
    )->toBeTrue();
});

// 3. store requires name and currency_code
test('store requires name and currency_code', function () {
    $this->postJson('/finance/price-lists', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'currency_code']);
});

// 4. setting is_default clears other defaults
test('setting is_default clears other defaults', function () {
    $listA = PriceList::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'List A',
        'currency_code' => 'USD',
        'is_default'    => true,
    ]);

    $this->post('/finance/price-lists', [
        'name'          => 'List B',
        'currency_code' => 'USD',
        'is_default'    => true,
    ])->assertRedirect();

    expect($listA->fresh()->is_default)->toBeFalse();
    $listB = PriceList::where('name', 'List B')->first();
    expect($listB->is_default)->toBeTrue();
});

// 5. admin can view a price list
test('admin can view a price list', function () {
    $priceList = PriceList::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'View Test',
        'currency_code' => 'USD',
    ]);

    $this->get("/finance/price-lists/{$priceList->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/PriceLists/Show'));
});

// 6. admin can add an item to a price list
test('admin can add an item to a price list', function () {
    $priceList = PriceList::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Item Test',
        'currency_code' => 'USD',
    ]);
    $product = makeProduct();

    $this->post("/finance/price-lists/{$priceList->id}/items", [
        'product_id'   => $product->id,
        'unit_price'   => 8.00,
        'min_quantity' => 1,
    ])->assertRedirect();

    expect(PriceListItem::where('price_list_id', $priceList->id)
        ->where('product_id', $product->id)
        ->exists()
    )->toBeTrue();
});

// 7. admin can remove an item
test('admin can remove an item', function () {
    $priceList = PriceList::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Remove Test',
        'currency_code' => 'USD',
    ]);
    $product = makeProduct();

    $item = PriceListItem::create([
        'tenant_id'     => $this->tenant->id,
        'price_list_id' => $priceList->id,
        'product_id'    => $product->id,
        'unit_price'    => 8.00,
        'min_quantity'  => 1,
    ]);

    $this->delete("/finance/price-lists/{$priceList->id}/items/{$item->id}")
        ->assertRedirect();

    expect(PriceListItem::find($item->id))->toBeNull();
});

// 8. getPriceForProduct returns correct tier
test('getPriceForProduct returns correct tier', function () {
    $priceList = PriceList::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Tiered List',
        'currency_code' => 'USD',
    ]);
    $product = makeProduct();

    PriceListItem::create([
        'tenant_id'     => $this->tenant->id,
        'price_list_id' => $priceList->id,
        'product_id'    => $product->id,
        'unit_price'    => 10.00,
        'min_quantity'  => 1,
    ]);

    PriceListItem::create([
        'tenant_id'     => $this->tenant->id,
        'price_list_id' => $priceList->id,
        'product_id'    => $product->id,
        'unit_price'    => 8.00,
        'min_quantity'  => 10,
    ]);

    expect($priceList->getPriceForProduct($product->id, 10))->toBe(8.0);
    expect($priceList->getPriceForProduct($product->id, 1))->toBe(10.0);
});

// 9. getPriceForProduct returns null when no matching item
test('getPriceForProduct returns null when no matching item', function () {
    $priceList = PriceList::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Empty List',
        'currency_code' => 'USD',
    ]);
    $product = makeProduct();

    expect($priceList->getPriceForProduct($product->id))->toBeNull();
});

// 10. staff cannot delete a price list
test('staff cannot delete a price list', function () {
    $priceList = PriceList::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Staff Delete Test',
        'currency_code' => 'USD',
    ]);

    $this->actingAs($this->staff)
        ->delete("/finance/price-lists/{$priceList->id}")
        ->assertStatus(403);
});

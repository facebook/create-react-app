<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\PriceList;
use App\Modules\Finance\Models\PriceListItem;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Price Co', 'slug' => 'price-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makePriceProduct(array $attrs = []): Product
{
    return Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Item ' . uniqid(),
        'sku'        => 'SKU-PL-' . uniqid(),
        'sale_price' => 100.00,
        'cost_price' => 50.00,
        'is_active'  => true,
        ...$attrs,
    ]);
}

test('can create a price list', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/price-lists', [
            'name'             => 'VIP Pricing',
            'discount_percent' => 15.0,
            'currency_code'    => 'USD',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'VIP Pricing');
});

test('can list price lists', function () {
    PriceList::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Standard',
        'is_active' => true,
        'is_default' => true,
    ]);

    $this->withToken($this->token)
        ->getJson('/api/v1/price-lists')
        ->assertStatus(200)
        ->assertJsonStructure(['data']);
});

test('can view price list with items', function () {
    $pl      = PriceList::create(['tenant_id' => $this->tenant->id, 'name' => 'Retail', 'is_active' => true, 'is_default' => false]);
    $product = makePriceProduct();

    PriceListItem::create([
        'tenant_id'     => $this->tenant->id,
        'price_list_id' => $pl->id,
        'product_id'    => $product->id,
        'unit_price'    => 85.00,
        'min_quantity'  => 1,
    ]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/price-lists/{$pl->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'name', 'items']]);

    expect(count($response->json('data.items')))->toBe(1);
});

test('can add a product to a price list', function () {
    $pl      = PriceList::create(['tenant_id' => $this->tenant->id, 'name' => 'Wholesale', 'is_active' => true, 'is_default' => false]);
    $product = makePriceProduct();

    $this->withToken($this->token)
        ->postJson("/api/v1/price-lists/{$pl->id}/items", [
            'product_id'   => $product->id,
            'unit_price'   => 75.00,
            'min_quantity' => 10,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.unit_price', '75.0000');
});

test('can remove a product from a price list', function () {
    $pl      = PriceList::create(['tenant_id' => $this->tenant->id, 'name' => 'Temp PL', 'is_active' => true, 'is_default' => false]);
    $product = makePriceProduct();

    $item = PriceListItem::create([
        'tenant_id'     => $this->tenant->id,
        'price_list_id' => $pl->id,
        'product_id'    => $product->id,
        'unit_price'    => 90.00,
        'min_quantity'  => 1,
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/price-lists/{$pl->id}/items/{$item->id}")
        ->assertStatus(200);

    expect(PriceListItem::find($item->id))->toBeNull();
});

test('can lookup product price from a price list', function () {
    $pl      = PriceList::create(['tenant_id' => $this->tenant->id, 'name' => 'Lookup PL', 'is_active' => true, 'is_default' => false]);
    $product = makePriceProduct();

    PriceListItem::create([
        'tenant_id'     => $this->tenant->id,
        'price_list_id' => $pl->id,
        'product_id'    => $product->id,
        'unit_price'    => 80.00,
        'min_quantity'  => 1,
    ]);

    $response = $this->withToken($this->token)
        ->postJson('/api/v1/price-lists/lookup', [
            'price_list_id' => $pl->id,
            'product_id'    => $product->id,
            'quantity'      => 1,
        ])
        ->assertStatus(200);

    expect((float) $response->json('data.unit_price'))->toBe(80.0);
    expect($response->json('data.has_override'))->toBeTrue();
});

test('lookup returns null for products not on price list', function () {
    $pl      = PriceList::create(['tenant_id' => $this->tenant->id, 'name' => 'Empty PL', 'is_active' => true, 'is_default' => false]);
    $product = makePriceProduct();

    $response = $this->withToken($this->token)
        ->postJson('/api/v1/price-lists/lookup', [
            'price_list_id' => $pl->id,
            'product_id'    => $product->id,
        ])
        ->assertStatus(200);

    expect($response->json('data.unit_price'))->toBeNull();
    expect($response->json('data.has_override'))->toBeFalse();
});

test('setting default clears other defaults', function () {
    $pl1 = PriceList::create(['tenant_id' => $this->tenant->id, 'name' => 'PL1', 'is_active' => true, 'is_default' => true]);
    $pl2 = PriceList::create(['tenant_id' => $this->tenant->id, 'name' => 'PL2', 'is_active' => true, 'is_default' => false]);

    $this->withToken($this->token)
        ->putJson("/api/v1/price-lists/{$pl2->id}", ['is_default' => true])
        ->assertStatus(200);

    expect($pl1->fresh()->is_default)->toBeFalse();
    expect($pl2->fresh()->is_default)->toBeTrue();
});

test('can soft delete a price list', function () {
    $pl = PriceList::create(['tenant_id' => $this->tenant->id, 'name' => 'Delete Me', 'is_active' => true, 'is_default' => false]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/price-lists/{$pl->id}")
        ->assertStatus(200);

    expect(PriceList::withTrashed()->find($pl->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/price-lists')->assertStatus(401);
});

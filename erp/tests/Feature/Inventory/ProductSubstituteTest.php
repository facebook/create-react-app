<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductSubstitute;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SubCorp', 'slug' => 'sub-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSubProduct(): Product
{
    return Product::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'SubProd-' . uniqid(),
        'sku'       => uniqid(),
        'type'      => 'physical',
        'is_active' => true,
    ]);
}

function makeSubLink(Product $product, Product $substitute, array $attrs = []): ProductSubstitute
{
    return ProductSubstitute::create([
        'tenant_id'             => test()->tenant->id,
        'product_id'            => $product->id,
        'substitute_product_id' => $substitute->id,
        'priority'              => 1,
        'is_active'             => true,
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $product = makeSubProduct();
    $this->post('/logout');
    $this->get("/inventory/products/{$product->id}/substitutes")->assertRedirect('/login');
});

it('admin can list product substitutes for a product', function () {
    $product = makeSubProduct();
    $sub     = makeSubProduct();
    makeSubLink($product, $sub);

    $this->get("/inventory/products/{$product->id}/substitutes")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/ProductSubstitutes/Index'));
});

it('staff with inventory.view can list substitutes', function () {
    $this->actingAs($this->staff);
    $product = makeSubProduct();

    $this->get("/inventory/products/{$product->id}/substitutes")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/ProductSubstitutes/Index'));
});

it('store creates a substitute link', function () {
    $product = makeSubProduct();
    $sub     = makeSubProduct();

    $this->post("/inventory/products/{$product->id}/substitutes", [
        'substitute_product_id' => $sub->id,
        'priority'              => 2,
        'is_bidirectional'      => false,
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(ProductSubstitute::where('product_id', $product->id)
        ->where('substitute_product_id', $sub->id)
        ->exists())->toBeTrue();
});

it('store validates substitute_product_id must differ from product', function () {
    $product = makeSubProduct();

    $this->postJson("/inventory/products/{$product->id}/substitutes", [
        'substitute_product_id' => $product->id,
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['substitute_product_id']);
});

it('store validates required substitute_product_id', function () {
    $product = makeSubProduct();

    $this->postJson("/inventory/products/{$product->id}/substitutes", [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['substitute_product_id']);
});

it('store with is_bidirectional creates reverse link too', function () {
    $product = makeSubProduct();
    $sub     = makeSubProduct();

    $this->post("/inventory/products/{$product->id}/substitutes", [
        'substitute_product_id' => $sub->id,
        'is_bidirectional'      => true,
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(ProductSubstitute::where('product_id', $product->id)
        ->where('substitute_product_id', $sub->id)
        ->exists())->toBeTrue();

    expect(ProductSubstitute::where('product_id', $sub->id)
        ->where('substitute_product_id', $product->id)
        ->exists())->toBeTrue();
});

it('update modifies priority and is_active', function () {
    $product = makeSubProduct();
    $sub     = makeSubProduct();
    $link    = makeSubLink($product, $sub);

    $this->patch("/inventory/products/{$product->id}/substitutes/{$link->id}", [
        'priority'  => 5,
        'is_active' => false,
    ])->assertRedirect()->assertSessionHasNoErrors();

    $link->refresh();
    expect($link->priority)->toBe(5);
    expect($link->is_active)->toBeFalse();
});

it('destroy removes the substitute link', function () {
    $product = makeSubProduct();
    $sub     = makeSubProduct();
    $link    = makeSubLink($product, $sub);

    $this->delete("/inventory/products/{$product->id}/substitutes/{$link->id}")
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(ProductSubstitute::find($link->id))->toBeNull();
});

it('product activeSubstitutes relation only returns active ones', function () {
    $product   = makeSubProduct();
    $activeSub = makeSubProduct();
    $inactSub  = makeSubProduct();

    makeSubLink($product, $activeSub, ['is_active' => true]);
    makeSubLink($product, $inactSub, ['is_active' => false]);

    $activeSubstitutes = $product->activeSubstitutes()->get();

    expect($activeSubstitutes)->toHaveCount(1);
    expect($activeSubstitutes->first()->substitute_product_id)->toBe($activeSub->id);
});

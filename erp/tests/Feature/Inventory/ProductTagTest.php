<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductTag;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'TagCorp', 'slug' => 'tag-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeProductTag(array $attrs = []): ProductTag
{
    return ProductTag::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Tag-' . uniqid(),
        'color'      => '#6366f1',
        'is_active'  => true,
        ...$attrs,
    ]);
}

function makeTagProduct(): Product
{
    return Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'TagProd-' . uniqid(),
        'sku'        => uniqid(),
        'type'       => 'physical',
        'is_active'  => true,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/inventory/product-tags')->assertRedirect('/login');
});

it('admin can list product tags', function () {
    makeProductTag();

    $this->get('/inventory/product-tags')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/ProductTags/Index'));
});

it('staff with inventory.view can list tags', function () {
    $this->actingAs($this->staff);
    $this->get('/inventory/product-tags')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/ProductTags/Index'));
});

it('store creates a product tag', function () {
    $this->post('/inventory/product-tags', [
        'name'  => 'New Tag',
        'color' => '#ff0000',
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(ProductTag::where('name', 'New Tag')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

it('store validates required name field', function () {
    $this->postJson('/inventory/product-tags', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

it('update modifies a product tag', function () {
    $tag = makeProductTag();

    $this->put("/inventory/product-tags/{$tag->id}", [
        'name'  => 'Updated Tag',
        'color' => '#00ff00',
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect($tag->fresh()->name)->toBe('Updated Tag');
});

it('destroy deletes a product tag', function () {
    $tag = makeProductTag();

    $this->delete("/inventory/product-tags/{$tag->id}")
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(ProductTag::find($tag->id))->toBeNull();
});

it('attach adds a tag to a product', function () {
    $tag     = makeProductTag();
    $product = makeTagProduct();

    $this->post("/inventory/products/{$product->id}/tags", [
        'tag_id' => $tag->id,
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect($product->tags()->where('product_tag_id', $tag->id)->exists())->toBeTrue();
});

it('detach removes a tag from a product', function () {
    $tag     = makeProductTag();
    $product = makeTagProduct();
    $product->tags()->attach($tag->id);

    $this->delete("/inventory/products/{$product->id}/tags/{$tag->id}")
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($product->tags()->where('product_tag_id', $tag->id)->exists())->toBeFalse();
});

it('product_count accessor returns correct count', function () {
    $tag      = makeProductTag();
    $product1 = makeTagProduct();
    $product2 = makeTagProduct();

    $tag->products()->attach([$product1->id, $product2->id]);

    expect($tag->product_count)->toBe(2);
});

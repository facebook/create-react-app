<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Cat Co', 'slug' => 'cat-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
});

test('product categories index renders', function () {
    $this->get('/inventory/product-categories')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/ProductCategories/Index'));
});

test('can create a product category', function () {
    $this->post('/inventory/product-categories', [
        'name'   => 'Electronics',
        'colour' => '#6366f1',
    ])->assertSessionHasNoErrors();

    expect(ProductCategory::where('name', 'Electronics')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('slug is auto-generated from name', function () {
    $this->post('/inventory/product-categories', ['name' => 'Office Supplies', 'colour' => '#6366f1'])
        ->assertSessionHasNoErrors();
    expect(ProductCategory::where('tenant_id', $this->tenant->id)->where('slug', 'office-supplies')->exists())->toBeTrue();
});

test('duplicate slug gets counter suffix', function () {
    $this->post('/inventory/product-categories', ['name' => 'Tools', 'colour' => '#6366f1']);
    $this->post('/inventory/product-categories', ['name' => 'Tools', 'colour' => '#ff0000']);

    expect(ProductCategory::where('tenant_id', $this->tenant->id)->count())->toBe(2);
    expect(ProductCategory::where('tenant_id', $this->tenant->id)->where('slug', 'tools-2')->exists())->toBeTrue();
});

test('can update a category', function () {
    $cat = ProductCategory::create([
        'tenant_id' => $this->tenant->id, 'name' => 'Old', 'slug' => 'old', 'colour' => '#6366f1',
    ]);
    $this->patch("/inventory/product-categories/{$cat->id}", ['name' => 'New Name', 'colour' => '#6366f1'])
        ->assertSessionHasNoErrors();
    expect($cat->fresh()->name)->toBe('New Name');
});

test('deleting category nulls product category_id', function () {
    $cat = ProductCategory::create([
        'tenant_id' => $this->tenant->id, 'name' => 'Temp', 'slug' => 'temp', 'colour' => '#6366f1',
    ]);
    $product = Product::create([
        'tenant_id' => $this->tenant->id, 'sku' => 'T01', 'name' => 'T-Prod',
        'cost_price' => 1, 'sale_price' => 2, 'category_id' => $cat->id,
    ]);
    $this->delete("/inventory/product-categories/{$cat->id}")->assertSessionHasNoErrors();
    expect($product->fresh()->category_id)->toBeNull();
});

test('products can be filtered by category', function () {
    $cat = ProductCategory::create([
        'tenant_id' => $this->tenant->id, 'name' => 'Filter', 'slug' => 'filter', 'colour' => '#6366f1',
    ]);
    Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'F01', 'name' => 'In',  'cost_price' => 5, 'sale_price' => 10, 'category_id' => $cat->id]);
    Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'F02', 'name' => 'Out', 'cost_price' => 5, 'sale_price' => 10]);

    $this->get("/inventory/products?category_id={$cat->id}")
        ->assertInertia(fn ($p) => $p->has('products.data', 1));
});

test('staff cannot create categories', function () {
    $this->actingAs($this->staff)
        ->post('/inventory/product-categories', ['name' => 'X', 'colour' => '#6366f1'])
        ->assertStatus(403);
});

test('invalid colour is rejected', function () {
    $this->post('/inventory/product-categories', ['name' => 'X', 'colour' => 'notacolour'])
        ->assertSessionHasErrors('colour');
});

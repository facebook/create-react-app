<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\UnitOfMeasure;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('product index is accessible to user with permission', function () {
    $response = $this->actingAs($this->admin)->get('/inventory/products');
    $response->assertStatus(200);
    $response->assertInertia(fn ($p) => $p->component('Inventory/Products/Index'));
});

test('product can be created', function () {
    $category = ProductCategory::create(['tenant_id' => $this->tenant->id, 'name' => 'Cat A', 'slug' => 'cat-a', 'colour' => '#6366f1']);
    $uom      = UnitOfMeasure::create(['tenant_id' => $this->tenant->id, 'name' => 'Pieces', 'abbreviation' => 'pcs']);

    $this->actingAs($this->admin)->post('/inventory/products', [
        'sku'           => 'SKU-001',
        'name'          => 'Test Product',
        'category_id'   => $category->id,
        'uom_id'        => $uom->id,
        'cost_price'    => '10.00',
        'sale_price'    => '19.99',
        'reorder_point' => 5,
        'is_active'     => true,
    ])->assertRedirect('/inventory/products');

    expect(Product::where('sku', 'SKU-001')->exists())->toBeTrue();
});

test('product sku must be unique per tenant', function () {
    Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'DUP-001', 'name' => 'First', 'cost_price' => 0, 'sale_price' => 0]);

    $this->actingAs($this->admin)->post('/inventory/products', [
        'sku' => 'DUP-001', 'name' => 'Second', 'cost_price' => '5.00', 'sale_price' => '10.00',
    ])->assertSessionHasErrors('sku');
});

test('product can be updated', function () {
    $product = Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'UPD-001', 'name' => 'Old Name', 'cost_price' => 5, 'sale_price' => 10]);

    $this->actingAs($this->admin)->put("/inventory/products/{$product->id}", [
        'sku' => 'UPD-001', 'name' => 'New Name', 'cost_price' => '6.00', 'sale_price' => '12.00',
    ])->assertRedirect();

    expect($product->fresh()->name)->toBe('New Name');
});

test('product can be soft-deleted', function () {
    $product = Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'DEL-001', 'name' => 'To Delete', 'cost_price' => 0, 'sale_price' => 0]);

    $this->actingAs($this->admin)->delete("/inventory/products/{$product->id}");

    expect(Product::find($product->id))->toBeNull();
    expect(Product::withTrashed()->find($product->id))->not->toBeNull();
});

test('product show page renders', function () {
    $product = Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'SHW-001', 'name' => 'Show Product', 'cost_price' => 0, 'sale_price' => 0]);

    $this->actingAs($this->admin)->get("/inventory/products/{$product->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/Products/Show'));
});

test('product search filters results', function () {
    Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'AAA', 'name' => 'Alpha Widget', 'cost_price' => 0, 'sale_price' => 0]);
    Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'BBB', 'name' => 'Beta Gadget',  'cost_price' => 0, 'sale_price' => 0]);

    $this->actingAs($this->admin)->get('/inventory/products?search=Alpha')
        ->assertInertia(fn ($p) =>
            $p->component('Inventory/Products/Index')
              ->has('products.data', 1)
              ->where('products.data.0.name', 'Alpha Widget')
        );
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Perm Co', 'slug' => 'perm-co']);
});

function userWithRole(Tenant $tenant, string $role): User
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole($role);
    return $user;
}

test('staff can view product list', function () {
    $this->actingAs(userWithRole($this->tenant, 'staff'))
         ->get('/inventory/products')
         ->assertStatus(200);
});

test('staff cannot access product create page', function () {
    $this->actingAs(userWithRole($this->tenant, 'staff'))
         ->get('/inventory/products/create')
         ->assertStatus(403);
});

test('staff cannot POST a new product', function () {
    $this->actingAs(userWithRole($this->tenant, 'staff'))
         ->post('/inventory/products', ['sku' => 'S1', 'name' => 'X', 'cost_price' => 1, 'sale_price' => 2])
         ->assertStatus(403);
});

test('manager can create a product', function () {
    $this->actingAs(userWithRole($this->tenant, 'manager'))
         ->post('/inventory/products', ['sku' => 'MGR-001', 'name' => 'Manager Product', 'cost_price' => '5.00', 'sale_price' => '10.00'])
         ->assertRedirect('/inventory/products');
});

test('staff cannot delete a product', function () {
    $product = Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'DEL-P', 'name' => 'Del', 'cost_price' => 0, 'sale_price' => 0]);

    $this->actingAs(userWithRole($this->tenant, 'staff'))
         ->delete("/inventory/products/{$product->id}")
         ->assertStatus(403);
});

test('admin can delete a product', function () {
    $product = Product::create(['tenant_id' => $this->tenant->id, 'sku' => 'DEL-A', 'name' => 'Admin Del', 'cost_price' => 0, 'sale_price' => 0]);

    $this->actingAs(userWithRole($this->tenant, 'admin'))
         ->delete("/inventory/products/{$product->id}")
         ->assertRedirect('/inventory/products');

    expect(Product::find($product->id))->toBeNull();
});

test('guest is redirected from inventory routes', function () {
    $this->get('/inventory/products')->assertRedirect('/login');
    $this->get('/inventory/suppliers')->assertRedirect('/login');
    $this->get('/inventory/purchase-orders')->assertRedirect('/login');
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\SalesOrder;
use App\Modules\Inventory\Models\SalesOrderItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Sales Corp', 'slug' => 'sales-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSOProduct(): Product
{
    $cat = ProductCategory::create(['tenant_id' => test()->tenant->id, 'name' => 'SO Cat', 'colour' => '#000']);
    return Product::create([
        'tenant_id'     => test()->tenant->id,
        'sku'           => 'SOSKU-' . uniqid(),
        'name'          => 'SO Product',
        'cost_price'    => 10,
        'sale_price'    => 25,
        'reorder_point' => 5,
        'category_id'   => $cat->id,
        'is_active'     => true,
    ]);
}

function makeSalesOrder(string $status = 'draft'): SalesOrder
{
    $so = SalesOrder::create([
        'tenant_id'  => test()->tenant->id,
        'so_number'  => 'SO-' . uniqid(),
        'status'     => $status,
        'order_date' => now()->toDateString(),
        'subtotal'   => 50,
        'tax'        => 0,
        'total'      => 50,
        'created_by' => test()->admin->id,
    ]);
    SalesOrderItem::create([
        'tenant_id'      => test()->tenant->id,
        'sales_order_id' => $so->id,
        'description'    => 'Widget',
        'quantity'       => 2,
        'unit_price'     => 25,
        'shipped_qty'    => 0,
    ]);
    return $so;
}

it('admin can list sales orders', function () {
    $this->get('/inventory/sales-orders')->assertStatus(200);
});

it('admin can create a sales order with items', function () {
    $this->post('/inventory/sales-orders', [
        'order_date' => now()->toDateString(),
        'currency'   => 'USD',
        'items'      => [
            ['description' => 'Widget A', 'quantity' => 3, 'unit_price' => 15],
        ],
    ])->assertRedirect();
    $so = SalesOrder::latest()->first();
    expect($so)->not->toBeNull();
    expect($so->items()->count())->toBe(1);
});

it('sales order store requires items', function () {
    $this->postJson('/inventory/sales-orders', [
        'order_date' => now()->toDateString(),
        'items'      => [],
    ])->assertStatus(422)->assertJsonValidationErrors(['items']);
});

it('admin can view a sales order', function () {
    $so = makeSalesOrder();
    $this->get("/inventory/sales-orders/{$so->id}")->assertStatus(200);
});

it('admin can confirm a sales order', function () {
    $so = makeSalesOrder('draft');
    $this->post("/inventory/sales-orders/{$so->id}/confirm")->assertRedirect();
    expect($so->fresh()->status)->toBe('confirmed');
    expect($so->fresh()->confirmed_at)->not->toBeNull();
});

it('admin can ship a sales order', function () {
    $so = makeSalesOrder('confirmed');
    $this->post("/inventory/sales-orders/{$so->id}/ship")->assertRedirect();
    expect($so->fresh()->status)->toBe('shipped');
});

it('admin can deliver a sales order', function () {
    $so = makeSalesOrder('shipped');
    $this->post("/inventory/sales-orders/{$so->id}/deliver")->assertRedirect();
    expect($so->fresh()->status)->toBe('delivered');
});

it('admin can cancel a sales order', function () {
    $so = makeSalesOrder('draft');
    $this->post("/inventory/sales-orders/{$so->id}/cancel")->assertRedirect();
    expect($so->fresh()->status)->toBe('cancelled');
});

it('is_open returns true for draft and confirmed', function () {
    $so = makeSalesOrder('draft');
    expect($so->is_open)->toBeTrue();
    $so->cancel();
    expect($so->fresh()->is_open)->toBeFalse();
});

it('staff cannot delete a sales order', function () {
    $so = makeSalesOrder();
    $this->actingAs($this->staff)
        ->delete("/inventory/sales-orders/{$so->id}")
        ->assertStatus(403);
});

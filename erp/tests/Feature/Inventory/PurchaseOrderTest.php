<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\PurchaseOrder;
use App\Modules\Inventory\Models\PurchaseOrderItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PO Corp', 'slug' => 'po-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePoProduct(): Product
{
    $cat = ProductCategory::create(['tenant_id' => test()->tenant->id, 'name' => 'PO Cat', 'colour' => '#000']);
    return Product::create([
        'tenant_id'     => test()->tenant->id,
        'sku'           => 'POSKU-' . uniqid(),
        'name'          => 'PO Product',
        'cost_price'    => 10,
        'sale_price'    => 20,
        'reorder_point' => 5,
        'category_id'   => $cat->id,
        'is_active'     => true,
    ]);
}

function makePurchaseOrder(string $status = 'draft'): PurchaseOrder
{
    $po = PurchaseOrder::create([
        'tenant_id'  => test()->tenant->id,
        'po_number'  => 'PO-' . uniqid(),
        'status'     => $status,
        'order_date' => now()->toDateString(),
        'subtotal'   => 100,
        'tax'        => 0,
        'total'      => 100,
        'created_by' => test()->admin->id,
    ]);
    PurchaseOrderItem::create([
        'tenant_id'         => test()->tenant->id,
        'purchase_order_id' => $po->id,
        'description'       => 'Widget',
        'quantity'          => 10,
        'unit_price'        => 10,
        'received_qty'      => 0,
    ]);
    return $po;
}

it('admin can list purchase orders', function () {
    $this->get('/inventory/purchase-orders')->assertStatus(200);
});

it('admin can create a purchase order with items', function () {
    $this->post('/inventory/purchase-orders', [
        'order_date' => now()->toDateString(),
        'currency'   => 'USD',
        'items'      => [
            ['description' => 'Widget A', 'quantity' => 5, 'unit_price' => 20],
            ['description' => 'Widget B', 'quantity' => 2, 'unit_price' => 50],
        ],
    ])->assertRedirect();
    $po = PurchaseOrder::latest()->first();
    expect($po)->not->toBeNull();
    expect($po->items()->count())->toBe(2);
});

it('purchase order store requires items', function () {
    $this->postJson('/inventory/purchase-orders', [
        'order_date' => now()->toDateString(),
        'items'      => [],
    ])->assertStatus(422)->assertJsonValidationErrors(['items']);
});

it('admin can view a purchase order', function () {
    $po = makePurchaseOrder();
    $this->get("/inventory/purchase-orders/{$po->id}")->assertStatus(200);
});

it('admin can send a purchase order', function () {
    $po = makePurchaseOrder('draft');
    $this->post("/inventory/purchase-orders/{$po->id}/send")->assertRedirect();
    expect($po->fresh()->status)->toBe('sent');
    expect($po->fresh()->sent_at)->not->toBeNull();
});

it('admin can cancel a purchase order', function () {
    $po = makePurchaseOrder('draft');
    $this->post("/inventory/purchase-orders/{$po->id}/cancel")->assertRedirect();
    expect($po->fresh()->status)->toBe('cancelled');
});

it('admin can receive items on a purchase order', function () {
    $po   = makePurchaseOrder('sent');
    $item = $po->items()->first();
    $this->post("/inventory/purchase-orders/{$po->id}/receive", [
        'items' => [['id' => $item->id, 'received_qty' => 10]],
    ])->assertRedirect();
    expect($item->fresh()->received_qty)->toBe(10.0);
    expect($po->fresh()->status)->toBe('received');
});

it('recalculateTotals sums item line totals', function () {
    $po = makePurchaseOrder();
    $po->recalculateTotals();
    expect($po->fresh()->subtotal)->toBe(100.0);
    expect($po->fresh()->total)->toBe(100.0);
});

it('is_open returns true for draft and sent status', function () {
    $po = makePurchaseOrder('draft');
    expect($po->is_open)->toBeTrue();
    $po->cancel();
    expect($po->fresh()->is_open)->toBeFalse();
});

it('staff cannot delete a purchase order', function () {
    $po = makePurchaseOrder();
    $this->actingAs($this->staff)
        ->delete("/inventory/purchase-orders/{$po->id}")
        ->assertStatus(403);
});

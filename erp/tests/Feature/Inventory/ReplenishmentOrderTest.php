<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ReplenishmentOrder;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'RepCorp', 'slug' => 'rep-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeRepWarehouse(array $attrs = []): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Warehouse ' . uniqid(),
        'is_active' => true,
        ...$attrs,
    ]);
}

function makeRepProduct(array $attrs = []): Product
{
    return Product::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Product ' . uniqid(),
        'sku'       => 'SKU-REP-' . uniqid(),
        ...$attrs,
    ]);
}

function makeReplenishment(array $attrs = []): ReplenishmentOrder
{
    $product   = makeRepProduct();
    $warehouse = makeRepWarehouse();

    return ReplenishmentOrder::create([
        'tenant_id'    => test()->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $warehouse->id,
        'qty_needed'   => 10,
        'qty_to_order' => 10,
        'route'        => 'buy',
        'status'       => 'draft',
        'created_by'   => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/replenishments')->assertRedirect('/login');
});

it('admin can list replenishments', function () {
    makeReplenishment();
    $this->get('/inventory/replenishments')->assertOk();
});

it('store creates a replenishment', function () {
    $product   = makeRepProduct();
    $warehouse = makeRepWarehouse();

    $this->post('/inventory/replenishments', [
        'product_id'   => $product->id,
        'warehouse_id' => $warehouse->id,
        'qty_needed'   => 20,
        'qty_to_order' => 20,
        'route'        => 'buy',
    ])->assertRedirect();

    expect(ReplenishmentOrder::where('product_id', $product->id)->exists())->toBeTrue();
});

it('store validates required: product_id, warehouse_id, qty_needed, qty_to_order, route', function () {
    $this->postJson('/inventory/replenishments', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['product_id', 'warehouse_id', 'qty_needed', 'qty_to_order', 'route']);
});

it('store rejects invalid route', function () {
    $product   = makeRepProduct();
    $warehouse = makeRepWarehouse();

    $this->postJson('/inventory/replenishments', [
        'product_id'   => $product->id,
        'warehouse_id' => $warehouse->id,
        'qty_needed'   => 5,
        'qty_to_order' => 5,
        'route'        => 'invalid_route',
    ])->assertStatus(422)->assertJsonValidationErrors(['route']);
});

it('show displays a replenishment', function () {
    $rep = makeReplenishment();
    $this->get("/inventory/replenishments/{$rep->id}")->assertOk();
});

it('confirm transitions to confirmed and generates order_number', function () {
    $rep = makeReplenishment();
    expect($rep->status)->toBe('draft');

    $this->post("/inventory/replenishments/{$rep->id}/confirm")->assertRedirect();

    $rep->refresh();
    expect($rep->status)->toBe('confirmed');
    expect($rep->order_number)->not->toBeNull();
    expect($rep->order_number)->toContain('REP-');
});

it('markInProgress transitions to in_progress', function () {
    $rep = makeReplenishment(['status' => 'confirmed']);
    $this->post("/inventory/replenishments/{$rep->id}/start")->assertRedirect();
    $rep->refresh();
    expect($rep->status)->toBe('in_progress');
});

it('complete transitions to done', function () {
    $rep = makeReplenishment(['status' => 'in_progress']);
    $this->post("/inventory/replenishments/{$rep->id}/complete")->assertRedirect();
    $rep->refresh();
    expect($rep->status)->toBe('done');
});

it('cancel transitions to cancelled', function () {
    $rep = makeReplenishment(['status' => 'confirmed']);
    $this->post("/inventory/replenishments/{$rep->id}/cancel")->assertRedirect();
    $rep->refresh();
    expect($rep->status)->toBe('cancelled');
});

it('routeLabel accessor returns Purchase Order for buy', function () {
    $rep = makeReplenishment(['route' => 'buy']);
    expect($rep->route_label)->toBe('Purchase Order');
});

it('destroy soft-deletes the replenishment', function () {
    $rep = makeReplenishment();
    $this->delete("/inventory/replenishments/{$rep->id}")->assertRedirect();
    expect(ReplenishmentOrder::find($rep->id))->toBeNull();
    expect(ReplenishmentOrder::withTrashed()->find($rep->id))->not->toBeNull();
});

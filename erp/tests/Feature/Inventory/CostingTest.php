<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\CostingLayer;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCostSnapshot;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Costing Co', 'slug' => 'costing-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->product = Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Test Widget',
        'sku'        => 'TW-001',
        'sale_price' => 20,
        'cost_price' => 10,
    ]);
});

test('admin can view costing index', function () {
    $this->get('/inventory/costing')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/Costing/Index'));
});

test('admin can add a costing layer', function () {
    $this->post('/inventory/costing/add-layer', [
        'product_id'     => $this->product->id,
        'costing_method' => 'fifo',
        'quantity'       => 100,
        'unit_cost'      => 5.00,
    ])->assertRedirect();

    $this->assertDatabaseHas('costing_layers', [
        'product_id'         => $this->product->id,
        'costing_method'     => 'fifo',
        'quantity_received'  => 100,
        'quantity_remaining' => 100,
        'unit_cost'          => 5.00,
    ]);
});

test('add-layer validation requires product_id, quantity, unit_cost', function () {
    $this->postJson('/inventory/costing/add-layer', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['product_id', 'quantity', 'unit_cost']);
});

test('admin can view product costing layers', function () {
    CostingLayer::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $this->product->id,
        'costing_method'     => 'fifo',
        'quantity_received'  => 50,
        'quantity_remaining' => 50,
        'unit_cost'          => 8.00,
        'received_at'        => now(),
    ]);

    $this->get("/inventory/costing/{$this->product->id}/layers")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/Costing/Layers'));
});

test('admin can take a snapshot', function () {
    $this->post('/inventory/costing/snapshot', [
        'product_id' => $this->product->id,
    ])->assertRedirect();

    $this->assertDatabaseHas('product_cost_snapshots', [
        'product_id' => $this->product->id,
        'tenant_id'  => $this->tenant->id,
    ]);
});

test('getAverageCost returns weighted average', function () {
    CostingLayer::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $this->product->id,
        'costing_method'     => 'fifo',
        'quantity_received'  => 10,
        'quantity_remaining' => 10,
        'unit_cost'          => 5.00,
        'received_at'        => now(),
    ]);

    CostingLayer::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $this->product->id,
        'costing_method'     => 'fifo',
        'quantity_received'  => 10,
        'quantity_remaining' => 10,
        'unit_cost'          => 15.00,
        'received_at'        => now(),
    ]);

    $avg = CostingLayer::getAverageCost($this->tenant->id, $this->product->id);

    expect($avg)->toBe(10.0);
});

test('consumeFifo consumes oldest layer first', function () {
    CostingLayer::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $this->product->id,
        'costing_method'     => 'fifo',
        'quantity_received'  => 10,
        'quantity_remaining' => 10,
        'unit_cost'          => 5.00,
        'received_at'        => now()->subDay(),
    ]);

    CostingLayer::create([
        'tenant_id'          => $this->tenant->id,
        'product_id'         => $this->product->id,
        'costing_method'     => 'fifo',
        'quantity_received'  => 10,
        'quantity_remaining' => 10,
        'unit_cost'          => 15.00,
        'received_at'        => now(),
    ]);

    $totalCost = CostingLayer::consumeFifo($this->tenant->id, $this->product->id, 15);

    // 10 units @ 5.00 = 50, 5 units @ 15.00 = 75, total = 125
    expect($totalCost)->toBe(125.0);
});

test('admin can view costing report', function () {
    $this->get('/inventory/costing/report')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/Costing/Report'));
});

test('staff cannot add a costing layer', function () {
    $this->actingAs($this->staff)
        ->post('/inventory/costing/add-layer', [
            'product_id'     => $this->product->id,
            'costing_method' => 'fifo',
            'quantity'       => 100,
            'unit_cost'      => 5.00,
        ])->assertStatus(403);
});

test('snapshot takeSnapshot creates correct record', function () {
    $snapshot = ProductCostSnapshot::takeSnapshot($this->tenant->id, $this->product->id);

    expect($snapshot->snapshot_date->toDateString())->toBe(now()->toDateString());
    expect($snapshot->product_id)->toBe($this->product->id);
    expect($snapshot->tenant_id)->toBe($this->tenant->id);
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockAdjustment;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Adj Co', 'slug' => 'adj-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    $this->warehouse = Warehouse::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Main Warehouse',
        'is_active' => true,
    ]);

    $this->product = Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Widget',
        'sku'        => 'WGT-001',
        'sale_price' => 10,
        'cost_price' => 5,
    ]);
});

test('admin can list stock adjustments', function () {
    $this->get('/inventory/stock-adjustments')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/StockAdjustments/Index'));
});

test('admin can view create form', function () {
    $this->get('/inventory/stock-adjustments/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/StockAdjustments/Create'));
});

test('admin can create stock adjustment', function () {
    $this->post('/inventory/stock-adjustments', [
        'warehouse_id' => $this->warehouse->id,
        'reference'    => 'ADJ-001',
        'reason'       => 'count',
        'notes'        => 'Monthly stock count',
        'items'        => [
            [
                'product_id'        => $this->product->id,
                'expected_quantity' => 10,
                'actual_quantity'   => 12,
            ],
        ],
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(StockAdjustment::where('reference', 'ADJ-001')->exists())->toBeTrue();
});

test('difference is calculated correctly', function () {
    $this->post('/inventory/stock-adjustments', [
        'warehouse_id' => $this->warehouse->id,
        'reference'    => 'ADJ-002',
        'reason'       => 'count',
        'items'        => [
            [
                'product_id'        => $this->product->id,
                'expected_quantity' => 10,
                'actual_quantity'   => 15,
            ],
        ],
    ]);

    $adj = StockAdjustment::where('reference', 'ADJ-002')->first();
    expect($adj)->not->toBeNull();
    $item = $adj->items()->first();
    expect((float) $item->difference)->toBe(5.0);
});

test('admin can view stock adjustment', function () {
    $adj = StockAdjustment::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $this->warehouse->id,
        'reference'    => 'ADJ-003',
        'reason'       => 'count',
        'status'       => 'draft',
    ]);

    $this->get("/inventory/stock-adjustments/{$adj->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Inventory/StockAdjustments/Show'));
});

test('confirming adjustment creates stock movement and increases stock', function () {
    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $this->product->id,
        'warehouse_id' => $this->warehouse->id,
        'quantity'     => 10,
    ]);

    $adj = StockAdjustment::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $this->warehouse->id,
        'reference'    => 'ADJ-004',
        'reason'       => 'count',
        'status'       => 'draft',
    ]);
    $adj->items()->create([
        'product_id'        => $this->product->id,
        'expected_quantity' => 10,
        'actual_quantity'   => 15,
        'difference'        => 5,
    ]);

    $this->post("/inventory/stock-adjustments/{$adj->id}/confirm")
        ->assertSessionHasNoErrors();

    $level = StockLevel::where('product_id', $this->product->id)
        ->where('warehouse_id', $this->warehouse->id)
        ->first();

    expect((float) $level->quantity)->toBe(15.0);
    $adj->refresh();
    expect($adj->status)->toBe('confirmed');
});

test('confirming adjustment with negative difference decreases stock', function () {
    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $this->product->id,
        'warehouse_id' => $this->warehouse->id,
        'quantity'     => 10,
    ]);

    $adj = StockAdjustment::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $this->warehouse->id,
        'reference'    => 'ADJ-005',
        'reason'       => 'damage',
        'status'       => 'draft',
    ]);
    $adj->items()->create([
        'product_id'        => $this->product->id,
        'expected_quantity' => 10,
        'actual_quantity'   => 5,
        'difference'        => -5,
    ]);

    $this->post("/inventory/stock-adjustments/{$adj->id}/confirm")
        ->assertSessionHasNoErrors();

    $level = StockLevel::where('product_id', $this->product->id)
        ->where('warehouse_id', $this->warehouse->id)
        ->first();

    expect((float) $level->quantity)->toBe(5.0);
});

test('admin can cancel draft adjustment', function () {
    $adj = StockAdjustment::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $this->warehouse->id,
        'reference'    => 'ADJ-006',
        'reason'       => 'count',
        'status'       => 'draft',
    ]);

    $this->post("/inventory/stock-adjustments/{$adj->id}/cancel")
        ->assertSessionHasNoErrors();

    $adj->refresh();
    expect($adj->status)->toBe('cancelled');
});

test('confirmed adjustment cannot be cancelled', function () {
    StockLevel::create([
        'tenant_id'    => $this->tenant->id,
        'product_id'   => $this->product->id,
        'warehouse_id' => $this->warehouse->id,
        'quantity'     => 10,
    ]);

    $adj = StockAdjustment::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $this->warehouse->id,
        'reference'    => 'ADJ-007',
        'reason'       => 'count',
        'status'       => 'draft',
    ]);
    $adj->items()->create([
        'product_id'        => $this->product->id,
        'expected_quantity' => 10,
        'actual_quantity'   => 10,
        'difference'        => 0,
    ]);

    // Confirm it first
    $this->post("/inventory/stock-adjustments/{$adj->id}/confirm");
    $adj->refresh();
    expect($adj->status)->toBe('confirmed');

    // Now try to cancel
    $this->post("/inventory/stock-adjustments/{$adj->id}/cancel")
        ->assertStatus(422);
});

test('staff cannot delete stock adjustment', function () {
    $adj = StockAdjustment::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $this->warehouse->id,
        'reference'    => 'ADJ-008',
        'reason'       => 'count',
        'status'       => 'draft',
    ]);

    $this->actingAs($this->staff)
        ->delete("/inventory/stock-adjustments/{$adj->id}")
        ->assertStatus(403);
});

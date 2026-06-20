<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\LotNumber;
use App\Modules\Inventory\Models\SerialNumber;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Lot Corp', 'slug' => 'lot-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeLotProduct(): Product {
    $cat = ProductCategory::create(['tenant_id' => test()->tenant->id, 'name' => 'Lot Cat', 'colour' => '#333']);
    return Product::create([
        'tenant_id'     => test()->tenant->id,
        'sku'           => 'LOT-' . uniqid(),
        'name'          => 'Lot Product',
        'cost_price'    => 5,
        'sale_price'    => 10,
        'reorder_point' => 5,
        'category_id'   => $cat->id,
        'is_active'     => true,
    ]);
}

function makeLotWarehouse(): Warehouse {
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Lot Warehouse',
        'is_active' => true,
    ]);
}

function makeLot(Product $product, Warehouse $warehouse, int $qty = 100): LotNumber {
    return LotNumber::create([
        'tenant_id'          => test()->tenant->id,
        'product_id'         => $product->id,
        'warehouse_id'       => $warehouse->id,
        'lot_number'         => 'LOT-' . uniqid(),
        'quantity_received'  => $qty,
        'quantity_remaining' => $qty,
        'status'             => 'active',
    ]);
}

it('admin can list lot numbers', function () {
    $this->get('/inventory/lot-numbers')->assertStatus(200);
});

it('admin can create a lot number', function () {
    $product   = makeLotProduct();
    $warehouse = makeLotWarehouse();
    $this->post('/inventory/lot-numbers', [
        'product_id'        => $product->id,
        'warehouse_id'      => $warehouse->id,
        'lot_number'        => 'LOT-2026-001',
        'quantity_received' => 500,
        'manufacture_date'  => now()->toDateString(),
        'expiry_date'       => now()->addYear()->toDateString(),
    ])->assertRedirect();
    $lot = LotNumber::where('lot_number', 'LOT-2026-001')->first();
    expect($lot)->not->toBeNull();
    expect($lot->quantity_remaining)->toBe(500);
});

it('lot store validates required fields', function () {
    $this->postJson('/inventory/lot-numbers', ['lot_number' => '', 'quantity_received' => 0])
        ->assertStatus(422)->assertJsonValidationErrors(['product_id', 'warehouse_id', 'lot_number']);
});

it('admin can quarantine a lot', function () {
    $product   = makeLotProduct();
    $warehouse = makeLotWarehouse();
    $lot       = makeLot($product, $warehouse);
    $this->post("/inventory/lot-numbers/{$lot->id}/quarantine", [
        'notes' => 'Failed quality check',
    ])->assertRedirect();
    expect($lot->fresh()->status)->toBe('quarantine');
});

it('consume reduces quantity_remaining and marks consumed', function () {
    $product   = makeLotProduct();
    $warehouse = makeLotWarehouse();
    $lot       = makeLot($product, $warehouse, 10);
    $lot->consume(10);
    expect($lot->fresh()->quantity_remaining)->toBe(0);
    expect($lot->fresh()->status)->toBe('consumed');
});

it('admin can list serial numbers', function () {
    $this->get('/inventory/serial-numbers')->assertStatus(200);
});

it('admin can create a serial number', function () {
    $product   = makeLotProduct();
    $warehouse = makeLotWarehouse();
    $this->post('/inventory/serial-numbers', [
        'product_id'    => $product->id,
        'warehouse_id'  => $warehouse->id,
        'serial_number' => 'SN-' . uniqid(),
        'received_date' => now()->toDateString(),
    ])->assertRedirect();
    expect(SerialNumber::where('product_id', $product->id)->exists())->toBeTrue();
});

it('admin can sell a serial number', function () {
    $product   = makeLotProduct();
    $warehouse = makeLotWarehouse();
    $sn = SerialNumber::create([
        'tenant_id'     => test()->tenant->id,
        'product_id'    => $product->id,
        'warehouse_id'  => $warehouse->id,
        'serial_number' => 'SN-SELL-' . uniqid(),
        'status'        => 'in_stock',
    ]);
    $this->post("/inventory/serial-numbers/{$sn->id}/sell")->assertRedirect();
    expect($sn->fresh()->status)->toBe('sold');
    expect($sn->fresh()->sold_date)->not->toBeNull();
});

it('is_expiring returns true within 30 days', function () {
    $product   = makeLotProduct();
    $warehouse = makeLotWarehouse();
    $lot = LotNumber::create([
        'tenant_id'          => test()->tenant->id,
        'product_id'         => $product->id,
        'warehouse_id'       => $warehouse->id,
        'lot_number'         => 'LOT-EXP-' . uniqid(),
        'quantity_received'  => 50,
        'quantity_remaining' => 50,
        'expiry_date'        => now()->addDays(15)->toDateString(),
    ]);
    expect($lot->is_expiring)->toBeTrue();
    expect($lot->is_expired)->toBeFalse();
});

it('staff cannot create a lot number', function () {
    $product   = makeLotProduct();
    $warehouse = makeLotWarehouse();
    $this->actingAs($this->staff)
        ->postJson('/inventory/lot-numbers', [
            'product_id'        => $product->id,
            'warehouse_id'      => $warehouse->id,
            'lot_number'        => 'LOT-STAFF-001',
            'quantity_received' => 10,
        ])->assertStatus(403);
});

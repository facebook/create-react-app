<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\LotNumber;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\SerialNumber;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'TraceCorp', 'slug' => 'trace-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeTProduct(array $attrs = []): Product
{
    return Product::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Product ' . uniqid(),
        'sku'       => 'SKU-T-' . uniqid(),
        ...$attrs,
    ]);
}

function makeTWarehouse(array $attrs = []): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Warehouse ' . uniqid(),
        'is_active' => true,
        ...$attrs,
    ]);
}

function makeTLot(Product $product, Warehouse $warehouse, array $attrs = []): LotNumber
{
    return LotNumber::create([
        'tenant_id'          => test()->tenant->id,
        'product_id'         => $product->id,
        'warehouse_id'       => $warehouse->id,
        'lot_number'         => 'LOT-' . uniqid(),
        'quantity_received'  => 100,
        'quantity_remaining' => 100,
        'status'             => 'active',
        ...$attrs,
    ]);
}

function makeTSerial(Product $product, Warehouse $warehouse, array $attrs = []): SerialNumber
{
    return SerialNumber::create([
        'tenant_id'    => test()->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $warehouse->id,
        'serial_number' => 'SN-' . uniqid(),
        'status'       => 'in_stock',
        ...$attrs,
    ]);
}

function makeTMovement(Product $product, Warehouse $warehouse, array $attrs = []): StockMovement
{
    return StockMovement::create([
        'tenant_id'    => test()->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $warehouse->id,
        'type'         => 'in',
        'quantity'     => 10,
        'reference'    => 'REF-' . uniqid(),
        ...$attrs,
    ]);
}

it('traceability index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/traceability')->assertRedirect('/login');
});

it('admin can view traceability page with no filters', function () {
    $this->get('/inventory/traceability')->assertOk();
});

it('traceability page shows movements for a specific lot_id', function () {
    $product   = makeTProduct();
    $warehouse = makeTWarehouse();
    $lot       = makeTLot($product, $warehouse);

    makeTMovement($product, $warehouse, ['lot_id' => $lot->id]);

    $response = $this->get("/inventory/traceability?lot_id={$lot->id}");
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Inventory/Traceability/Index')
        ->has('movements', 1)
    );
});

it('traceability page shows movements for a specific serial_id', function () {
    $product   = makeTProduct();
    $warehouse = makeTWarehouse();
    $serial    = makeTSerial($product, $warehouse);

    makeTMovement($product, $warehouse, ['serial_id' => $serial->id]);

    $response = $this->get("/inventory/traceability?serial_id={$serial->id}");
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Inventory/Traceability/Index')
        ->has('movements', 1)
    );
});

it('traceability shows empty movements when lot has none', function () {
    $product = makeTProduct();
    $warehouse = makeTWarehouse();
    $lot     = makeTLot($product, $warehouse);

    $response = $this->get("/inventory/traceability?lot_id={$lot->id}");
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Inventory/Traceability/Index')
        ->has('movements', 0)
    );
});

it('StockMovement fillable includes lot_id and serial_id', function () {
    $movement = new StockMovement();
    expect($movement->getFillable())->toContain('lot_id');
    expect($movement->getFillable())->toContain('serial_id');
});

it('StockMovement lot() relation works', function () {
    $product   = makeTProduct();
    $warehouse = makeTWarehouse();
    $lot       = makeTLot($product, $warehouse);

    $movement = makeTMovement($product, $warehouse, ['lot_id' => $lot->id]);

    expect($movement->lot)->not->toBeNull();
    expect($movement->lot->id)->toBe($lot->id);
});

it('StockMovement serial() relation works', function () {
    $product   = makeTProduct();
    $warehouse = makeTWarehouse();
    $serial    = makeTSerial($product, $warehouse);

    $movement = makeTMovement($product, $warehouse, ['serial_id' => $serial->id]);

    expect($movement->serial)->not->toBeNull();
    expect($movement->serial->id)->toBe($serial->id);
});

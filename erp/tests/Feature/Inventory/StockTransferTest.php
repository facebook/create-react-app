<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockTransfer;
use App\Modules\Inventory\Models\StockTransferItem;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseStock;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Transfer Co', 'slug' => 'transfer-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeWarehouse(string $name): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => $name,
        'is_active' => true,
    ]);
}

function makeTransferProduct(): Product
{
    return Product::create([
        'tenant_id'      => test()->tenant->id,
        'name'           => 'Transfer Widget',
        'sku'            => 'TW-001',
        'stock_quantity' => 100,
        'is_active'      => true,
    ]);
}

it('admin can list stock transfers', function () {
    $this->get('/inventory/stock-transfers')->assertStatus(200);
});

it('admin can create a stock transfer', function () {
    $wh1 = makeWarehouse('Warehouse A');
    $wh2 = makeWarehouse('Warehouse B');
    $product = makeTransferProduct();

    $this->post('/inventory/stock-transfers', [
        'from_warehouse_id' => $wh1->id,
        'to_warehouse_id'   => $wh2->id,
        'items'             => [
            ['product_id' => $product->id, 'quantity' => 10],
        ],
    ])->assertRedirect();

    expect(StockTransfer::where('from_warehouse_id', $wh1->id)->exists())->toBeTrue();
});

it('admin can complete a stock transfer and stock moves', function () {
    $wh1 = makeWarehouse('Source');
    $wh2 = makeWarehouse('Dest');
    $product = makeTransferProduct();

    WarehouseStock::create([
        'tenant_id'    => test()->tenant->id,
        'warehouse_id' => $wh1->id,
        'product_id'   => $product->id,
        'quantity'     => 50,
    ]);

    $transfer = StockTransfer::create([
        'tenant_id'         => test()->tenant->id,
        'from_warehouse_id' => $wh1->id,
        'to_warehouse_id'   => $wh2->id,
        'status'            => 'draft',
    ]);
    StockTransferItem::create([
        'tenant_id'          => test()->tenant->id,
        'stock_transfer_id'  => $transfer->id,
        'product_id'         => $product->id,
        'quantity'           => 20,
    ]);

    $this->post("/inventory/stock-transfers/{$transfer->id}/complete");

    expect($transfer->fresh()->status)->toBe('completed');
    expect($transfer->fresh()->transferred_at)->not->toBeNull();

    $fromStock = WarehouseStock::where('warehouse_id', $wh1->id)->where('product_id', $product->id)->first();
    $toStock   = WarehouseStock::where('warehouse_id', $wh2->id)->where('product_id', $product->id)->first();

    expect((float)$fromStock->quantity)->toBe(30.0);
    expect((float)$toStock->quantity)->toBe(20.0);
});

it('admin can cancel a transfer', function () {
    $wh1 = makeWarehouse('Cancel Source');
    $wh2 = makeWarehouse('Cancel Dest');
    $transfer = StockTransfer::create([
        'tenant_id'         => test()->tenant->id,
        'from_warehouse_id' => $wh1->id,
        'to_warehouse_id'   => $wh2->id,
        'status'            => 'draft',
    ]);
    $this->post("/inventory/stock-transfers/{$transfer->id}/cancel");
    expect($transfer->fresh()->status)->toBe('cancelled');
});

it('from and to warehouse must differ', function () {
    $wh = makeWarehouse('Same Warehouse');
    $product = makeTransferProduct();
    $this->postJson('/inventory/stock-transfers', [
        'from_warehouse_id' => $wh->id,
        'to_warehouse_id'   => $wh->id,
        'items'             => [['product_id' => $product->id, 'quantity' => 1]],
    ])->assertStatus(422);
});

it('admin can view warehouse stock', function () {
    $this->get('/inventory/warehouse-stock')->assertStatus(200);
});

it('is_below_reorder_point is true when stock is low', function () {
    $wh = makeWarehouse('Low Stock WH');
    $product = makeTransferProduct();
    $stock = WarehouseStock::create([
        'tenant_id'     => test()->tenant->id,
        'warehouse_id'  => $wh->id,
        'product_id'    => $product->id,
        'quantity'      => 3,
        'reorder_point' => 10,
    ]);
    expect($stock->is_below_reorder_point)->toBeTrue();
});

it('is_below_reorder_point is false when stock is sufficient', function () {
    $wh = makeWarehouse('Good Stock WH');
    $product = makeTransferProduct();
    $stock = WarehouseStock::create([
        'tenant_id'     => test()->tenant->id,
        'warehouse_id'  => $wh->id,
        'product_id'    => $product->id,
        'quantity'      => 50,
        'reorder_point' => 10,
    ]);
    expect($stock->is_below_reorder_point)->toBeFalse();
});

it('staff cannot delete stock transfer', function () {
    $wh1 = makeWarehouse('Staff WH1');
    $wh2 = makeWarehouse('Staff WH2');
    $transfer = StockTransfer::create([
        'tenant_id'         => test()->tenant->id,
        'from_warehouse_id' => $wh1->id,
        'to_warehouse_id'   => $wh2->id,
        'status'            => 'draft',
    ]);
    $this->actingAs($this->staff)
        ->delete("/inventory/stock-transfers/{$transfer->id}")
        ->assertStatus(403);
});

it('admin can view a stock transfer', function () {
    $wh1 = makeWarehouse('View WH1');
    $wh2 = makeWarehouse('View WH2');
    $transfer = StockTransfer::create([
        'tenant_id'         => test()->tenant->id,
        'from_warehouse_id' => $wh1->id,
        'to_warehouse_id'   => $wh2->id,
        'status'            => 'draft',
    ]);
    $this->get("/inventory/stock-transfers/{$transfer->id}")->assertStatus(200);
});

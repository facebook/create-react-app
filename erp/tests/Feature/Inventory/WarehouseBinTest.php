<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\BinStockLocation;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseBin;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Bin Co', 'slug' => 'bin-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeBinWarehouse(string $name): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => $name,
        'is_active' => true,
    ]);
}

function makeBin(Warehouse $wh, string $code = 'A-01'): WarehouseBin
{
    return WarehouseBin::create([
        'tenant_id'    => test()->tenant->id,
        'warehouse_id' => $wh->id,
        'code'         => $code,
        'bin_type'     => 'standard',
        'is_active'    => true,
    ]);
}

it('admin can list warehouse bins', function () {
    $this->get('/inventory/warehouse-bins')->assertStatus(200);
});

it('admin can create a warehouse bin', function () {
    $wh = makeBinWarehouse('Main WH');

    $this->post('/inventory/warehouse-bins', [
        'warehouse_id' => $wh->id,
        'code'         => 'B-01',
        'bin_type'     => 'standard',
    ])->assertRedirect();

    expect(WarehouseBin::where('code', 'B-01')->exists())->toBeTrue();
});

it('store requires warehouse_id, code, bin_type', function () {
    $this->postJson('/inventory/warehouse-bins', [])->assertStatus(422);
});

it('admin can view a warehouse bin', function () {
    $wh  = makeBinWarehouse('View WH');
    $bin = makeBin($wh, 'V-01');

    $this->get("/inventory/warehouse-bins/{$bin->id}")->assertStatus(200);
});

it('admin can add stock to a bin', function () {
    $wh      = makeBinWarehouse('Stock WH');
    $bin     = makeBin($wh, 'S-01');
    $product = Product::create([
        'tenant_id'   => test()->tenant->id,
        'name'        => 'Widget',
        'sku'         => 'W-001',
        'cost_price'  => 5,
        'sale_price'  => 10,
        'is_active'   => true,
    ]);

    $this->post("/inventory/warehouse-bins/{$bin->id}/stock", [
        'product_id' => $product->id,
        'quantity'   => 50,
    ])->assertRedirect();

    expect(BinStockLocation::where('bin_id', $bin->id)->where('product_id', $product->id)->exists())->toBeTrue();
});

it('used_capacity is sum of stock quantities', function () {
    $wh  = makeBinWarehouse('Cap WH');
    $bin = WarehouseBin::create([
        'tenant_id'    => test()->tenant->id,
        'warehouse_id' => $wh->id,
        'code'         => 'CAP-01',
        'bin_type'     => 'standard',
        'capacity'     => 100,
        'is_active'    => true,
    ]);

    $productA = Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Product A',
        'sku'        => 'PA-001',
        'cost_price' => 1,
        'sale_price' => 2,
        'is_active'  => true,
    ]);
    $productB = Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Product B',
        'sku'        => 'PB-001',
        'cost_price' => 1,
        'sale_price' => 2,
        'is_active'  => true,
    ]);

    BinStockLocation::create([
        'tenant_id'  => test()->tenant->id,
        'bin_id'     => $bin->id,
        'product_id' => $productA->id,
        'quantity'   => 30,
    ]);
    BinStockLocation::create([
        'tenant_id'  => test()->tenant->id,
        'bin_id'     => $bin->id,
        'product_id' => $productB->id,
        'quantity'   => 20,
    ]);

    expect($bin->fresh()->used_capacity)->toBe(50.0);
});

it('available_capacity is capacity minus used', function () {
    $wh  = makeBinWarehouse('Avail WH');
    $bin = WarehouseBin::create([
        'tenant_id'    => test()->tenant->id,
        'warehouse_id' => $wh->id,
        'code'         => 'AV-01',
        'bin_type'     => 'standard',
        'capacity'     => 100,
        'is_active'    => true,
    ]);

    $product = Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Avail Product',
        'sku'        => 'AP-001',
        'cost_price' => 1,
        'sale_price' => 2,
        'is_active'  => true,
    ]);

    BinStockLocation::create([
        'tenant_id'  => test()->tenant->id,
        'bin_id'     => $bin->id,
        'product_id' => $product->id,
        'quantity'   => 50,
    ]);

    expect($bin->fresh()->available_capacity)->toBe(50.0);
});

it('is_expired is true when expiry_date is past', function () {
    $wh      = makeBinWarehouse('Expiry WH');
    $bin     = makeBin($wh, 'EX-01');
    $product = Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Expiry Product',
        'sku'        => 'EP-001',
        'cost_price' => 1,
        'sale_price' => 2,
        'is_active'  => true,
    ]);

    $location = BinStockLocation::create([
        'tenant_id'   => test()->tenant->id,
        'bin_id'      => $bin->id,
        'product_id'  => $product->id,
        'quantity'    => 10,
        'expiry_date' => Carbon::yesterday()->toDateString(),
    ]);

    expect($location->fresh()->is_expired)->toBeTrue();
});

it('admin can list zones', function () {
    $this->get('/inventory/warehouse-zones')->assertStatus(200);
});

it('staff cannot delete a bin', function () {
    $wh  = makeBinWarehouse('Staff WH');
    $bin = makeBin($wh, 'ST-01');

    $this->actingAs($this->staff)
        ->delete("/inventory/warehouse-bins/{$bin->id}")
        ->assertStatus(403);
});

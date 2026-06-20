<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseStock;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ReportCorp', 'slug' => 'report-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeRProduct(array $attrs = []): Product
{
    return Product::create([
        'tenant_id'     => test()->tenant->id,
        'name'          => 'Product ' . uniqid(),
        'sku'           => 'SKU-R-' . uniqid(),
        'cost_price'    => 10.00,
        'reorder_point' => 5,
        ...$attrs,
    ]);
}

function makeRWarehouse(array $attrs = []): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Warehouse ' . uniqid(),
        'is_active' => true,
        ...$attrs,
    ]);
}

function makeRStock(Product $product, Warehouse $warehouse, float $qty, float $reorder = 5): WarehouseStock
{
    return WarehouseStock::create([
        'tenant_id'    => test()->tenant->id,
        'warehouse_id' => $warehouse->id,
        'product_id'   => $product->id,
        'quantity'     => $qty,
        'reorder_point' => $reorder,
    ]);
}

function makeRMovement(Product $product, Warehouse $warehouse, string $type = 'in', float $qty = 10): StockMovement
{
    return StockMovement::create([
        'tenant_id'    => test()->tenant->id,
        'product_id'   => $product->id,
        'warehouse_id' => $warehouse->id,
        'type'         => $type,
        'quantity'     => $qty,
        'reference'    => 'REF-' . uniqid(),
    ]);
}

it('stock valuation page loads successfully', function () {
    $product   = makeRProduct();
    $warehouse = makeRWarehouse();
    makeRStock($product, $warehouse, 20);

    $this->get('/inventory/reports/stock-valuation')->assertOk();
});

it('stock movement page loads successfully', function () {
    $this->get('/inventory/reports/stock-movement')->assertOk();
});

it('low stock page loads successfully', function () {
    $this->get('/inventory/reports/low-stock')->assertOk();
});

it('abc analysis page loads successfully', function () {
    $this->get('/inventory/reports/abc-analysis')->assertOk();
});

it('multi-warehouse overview page loads successfully', function () {
    makeRWarehouse();
    $this->get('/inventory/multi-warehouse')->assertOk();
});

it('stock movement filters by date range', function () {
    $product   = makeRProduct();
    $warehouse = makeRWarehouse();
    makeRMovement($product, $warehouse, 'in', 10);

    $today    = now()->toDateString();
    $response = $this->get("/inventory/reports/stock-movement?date_from={$today}&date_to={$today}");
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Inventory/Reports/StockMovement')
        ->has('rows')
        ->has('summary')
    );
});

it('low stock report returns products below min level', function () {
    $product   = makeRProduct(['reorder_point' => 20]);
    $warehouse = makeRWarehouse();
    // Stock of 5, reorder_point 20 => should be flagged
    makeRStock($product, $warehouse, 5.0, 20.0);

    $response = $this->get('/inventory/reports/low-stock');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Inventory/Reports/LowStock')
        ->has('rows')
        ->where('summary.products_at_risk', fn($v) => $v >= 1)
    );
});

it('abc analysis assigns correct buckets', function () {
    $warehouse = makeRWarehouse();

    // Create products with movement over 90 days
    for ($i = 0; $i < 3; $i++) {
        $product = makeRProduct(['cost_price' => 100 - ($i * 30)]);
        makeRMovement($product, $warehouse, 'out', 100);
    }

    $response = $this->get('/inventory/reports/abc-analysis');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Inventory/Reports/AbcAnalysis')
        ->has('rows')
        ->has('bucket_summary')
    );
});

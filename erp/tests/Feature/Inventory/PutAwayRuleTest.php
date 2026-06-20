<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\PutAwayRule;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseBin;
use App\Modules\Inventory\Models\WarehouseZone;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PutAwayCorp', 'slug' => 'put-away-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePARWarehouse(array $attrs = []): Warehouse
{
    return Warehouse::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'PAR Warehouse ' . uniqid(),
        'location'  => 'Test Location',
        'is_active' => true,
        ...$attrs,
    ]);
}

function makePutAwayRule(?Warehouse $warehouse = null, array $attrs = []): PutAwayRule
{
    $warehouse ??= makePARWarehouse();
    return PutAwayRule::create([
        'tenant_id'    => test()->tenant->id,
        'name'         => 'Test Put-Away Rule ' . uniqid(),
        'warehouse_id' => $warehouse->id,
        'sequence'     => 10,
        'is_active'    => true,
        ...$attrs,
    ]);
}

it('put-away rules index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/put-away-rules')->assertRedirect('/login');
});

it('admin can list put-away rules', function () {
    makePutAwayRule();
    $this->get('/inventory/put-away-rules')->assertOk();
});

it('store creates a put-away rule', function () {
    $warehouse = makePARWarehouse();

    $this->post('/inventory/put-away-rules', [
        'name'         => 'Electronics Rule',
        'warehouse_id' => $warehouse->id,
        'sequence'     => 5,
    ])->assertRedirect();

    expect(PutAwayRule::where('name', 'Electronics Rule')->exists())->toBeTrue();
});

it('store validates required: name, warehouse_id', function () {
    $this->postJson('/inventory/put-away-rules', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'warehouse_id']);
});

it('activate and deactivate toggle is_active', function () {
    $rule = makePutAwayRule(attrs: ['is_active' => true]);

    $this->post("/inventory/put-away-rules/{$rule->id}/deactivate")->assertRedirect();
    expect($rule->fresh()->is_active)->toBeFalse();

    $this->post("/inventory/put-away-rules/{$rule->id}/activate")->assertRedirect();
    expect($rule->fresh()->is_active)->toBeTrue();
});

it('findBestRule finds product-specific rule first (over category rule)', function () {
    $warehouse = makePARWarehouse();
    $category  = ProductCategory::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'PAR Category ' . uniqid(),
        'slug'      => 'par-cat-' . uniqid(),
    ]);
    $product = Product::create([
        'tenant_id'   => $this->tenant->id,
        'sku'         => 'PAR-' . uniqid(),
        'name'        => 'PAR Product',
        'cost_price'  => 5.00,
        'sale_price'  => 10.00,
        'category_id' => $category->id,
    ]);

    // Category rule with lower sequence
    $categoryRule = makePutAwayRule($warehouse, [
        'product_category_id' => $category->id,
        'sequence'            => 5,
    ]);
    // Product-specific rule with higher sequence
    $productRule = makePutAwayRule($warehouse, [
        'product_id' => $product->id,
        'sequence'   => 20,
    ]);

    $best = PutAwayRule::findBestRule($this->tenant->id, $product->id, $warehouse->id);

    expect($best)->not->toBeNull();
    expect($best->id)->toBe($productRule->id);
});

it('findBestRule returns null when no rules match', function () {
    $warehouse = makePARWarehouse();
    $product   = Product::create([
        'tenant_id'  => $this->tenant->id,
        'sku'        => 'PAR2-' . uniqid(),
        'name'       => 'Unmatched Product',
        'cost_price' => 1.00,
        'sale_price' => 2.00,
    ]);

    $result = PutAwayRule::findBestRule($this->tenant->id, $product->id, $warehouse->id);

    expect($result)->toBeNull();
});

it('findBestRule respects sequence ordering', function () {
    $warehouse = makePARWarehouse();
    $product   = Product::create([
        'tenant_id'  => $this->tenant->id,
        'sku'        => 'PAR3-' . uniqid(),
        'name'       => 'Sequence Product',
        'cost_price' => 1.00,
        'sale_price' => 2.00,
    ]);

    $rule1 = makePutAwayRule($warehouse, ['product_id' => $product->id, 'sequence' => 20]);
    $rule2 = makePutAwayRule($warehouse, ['product_id' => $product->id, 'sequence' => 5]);

    $best = PutAwayRule::findBestRule($this->tenant->id, $product->id, $warehouse->id);

    expect($best)->not->toBeNull();
    expect($best->id)->toBe($rule2->id);
});

it('targetLocationLabel returns bin code when bin set', function () {
    $warehouse = makePARWarehouse();
    $zone      = WarehouseZone::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $warehouse->id,
        'name'         => 'Zone A',
        'code'         => 'ZA',
    ]);
    $bin = WarehouseBin::create([
        'tenant_id'    => $this->tenant->id,
        'warehouse_id' => $warehouse->id,
        'zone_id'      => $zone->id,
        'code'         => 'BIN-001',
        'name'         => 'Bin One',
    ]);

    $rule = makePutAwayRule($warehouse, [
        'location_out_bin_id' => $bin->id,
    ]);
    $rule->load('locationOutBin');

    expect($rule->target_location_label)->toBe('BIN-001');
});

it('destroy soft-deletes put-away rule', function () {
    $rule = makePutAwayRule();

    $this->delete("/inventory/put-away-rules/{$rule->id}")->assertRedirect();

    expect(PutAwayRule::find($rule->id))->toBeNull();
    expect(PutAwayRule::withTrashed()->find($rule->id))->not->toBeNull();
});

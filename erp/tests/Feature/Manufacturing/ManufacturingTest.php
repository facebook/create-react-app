<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Manufacturing\Models\BillOfMaterials;
use App\Modules\Manufacturing\Models\BomLine;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\Manufacturing\Models\WorkCenter;
use App\Modules\Manufacturing\Models\WorkOrder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'MfgCorp', 'slug' => 'mfg-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    // Create a reusable product
    $this->product = Product::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Product',
        'sku'       => 'TP-001-' . uniqid(),
        'cost_price' => 10.00,
        'sale_price' => 20.00,
    ]);
});

// ========================
// BOM Tests
// ========================

it('can list boms', function () {
    BillOfMaterials::create([
        'tenant_id'  => $this->tenant->id,
        'product_id' => $this->product->id,
        'name'       => 'Main BOM',
    ]);

    $this->get('/manufacturing/boms')->assertOk();
});

it('can create bom', function () {
    $this->post('/manufacturing/boms', [
        'product_id'  => $this->product->id,
        'name'        => 'Widget BOM',
        'type'        => 'manufacture',
        'qty_per_bom' => 1,
        'is_active'   => true,
        'lines'       => [],
    ])->assertRedirect();

    expect(BillOfMaterials::where('name', 'Widget BOM')->exists())->toBeTrue();
});

it('bom code can be set on create', function () {
    $this->post('/manufacturing/boms', [
        'product_id'  => $this->product->id,
        'name'        => 'Coded BOM',
        'code'        => 'BOM-001',
        'type'        => 'manufacture',
        'qty_per_bom' => 1,
        'is_active'   => true,
        'lines'       => [],
    ])->assertRedirect();

    expect(BillOfMaterials::where('code', 'BOM-001')->exists())->toBeTrue();
});

it('can update bom', function () {
    $bom = BillOfMaterials::create([
        'tenant_id'  => $this->tenant->id,
        'product_id' => $this->product->id,
        'name'       => 'Old BOM',
    ]);

    $this->put("/manufacturing/boms/{$bom->id}", [
        'product_id'  => $this->product->id,
        'name'        => 'Updated BOM',
        'type'        => 'kit',
        'qty_per_bom' => 2,
        'is_active'   => true,
        'lines'       => [],
    ])->assertRedirect();

    expect($bom->fresh()->name)->toBe('Updated BOM');
    expect($bom->fresh()->type)->toBe('kit');
});

it('can delete bom', function () {
    $bom = BillOfMaterials::create([
        'tenant_id'  => $this->tenant->id,
        'product_id' => $this->product->id,
        'name'       => 'Delete Me BOM',
    ]);

    $this->delete("/manufacturing/boms/{$bom->id}")->assertRedirect();

    expect(BillOfMaterials::find($bom->id))->toBeNull();
});

it('bom has correct lines after create', function () {
    $component = Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Component A',
        'sku'        => 'COMP-A-' . uniqid(),
        'cost_price' => 5.00,
        'sale_price' => 8.00,
    ]);

    $this->post('/manufacturing/boms', [
        'product_id'  => $this->product->id,
        'name'        => 'BOM with Lines',
        'type'        => 'manufacture',
        'qty_per_bom' => 1,
        'is_active'   => true,
        'lines'       => [
            ['component_id' => $component->id, 'quantity' => 2, 'uom' => 'pcs', 'sequence' => 10, 'is_optional' => false, 'notes' => ''],
        ],
    ])->assertRedirect();

    $bom = BillOfMaterials::where('name', 'BOM with Lines')->first();
    expect($bom)->not->toBeNull();
    expect($bom->lines()->count())->toBe(1);
    expect($bom->lines()->first()->component_id)->toBe($component->id);
    expect($bom->lines()->first()->quantity)->toBe(2.0);
});

// ========================
// Work Center Tests
// ========================

it('can list work centers', function () {
    WorkCenter::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Assembly Line 1',
    ]);

    $this->get('/manufacturing/work-centers')->assertOk();
});

it('can create work center', function () {
    $this->post('/manufacturing/work-centers', [
        'name'              => 'Welding Station',
        'code'              => 'WS-01',
        'capacity'          => 2,
        'efficiency_factor' => 95,
        'time_efficiency'   => 90,
        'hourly_cost'       => 50,
        'is_active'         => true,
    ])->assertRedirect();

    expect(WorkCenter::where('name', 'Welding Station')->exists())->toBeTrue();
});

it('can update work center', function () {
    $wc = WorkCenter::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Old Station',
    ]);

    $this->put("/manufacturing/work-centers/{$wc->id}", [
        'name'      => 'Updated Station',
        'is_active' => false,
    ])->assertRedirect();

    expect($wc->fresh()->name)->toBe('Updated Station');
    expect($wc->fresh()->is_active)->toBeFalse();
});

// ========================
// Manufacturing Order Tests
// ========================

it('can list manufacturing orders', function () {
    $this->get('/manufacturing/manufacturing-orders')->assertOk();
});

it('can create manufacturing order', function () {
    $this->post('/manufacturing/manufacturing-orders', [
        'product_id'     => $this->product->id,
        'qty_to_produce' => 100,
        'scheduled_date' => '2026-11-01',
    ])->assertRedirect();

    expect(ManufacturingOrder::where('product_id', $this->product->id)->exists())->toBeTrue();
});

it('mo confirm generates mo_number in correct format', function () {
    $mo = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $this->product->id,
        'qty_to_produce' => 50,
    ]);

    $mo->confirm();

    expect($mo->fresh()->status)->toBe('confirmed');
    expect($mo->fresh()->mo_number)->toMatch('/^MO-\d{4}-\d{5}$/');
});

it('mo start sets status in_progress', function () {
    $mo = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $this->product->id,
        'qty_to_produce' => 50,
        'status'         => 'confirmed',
    ]);

    $mo->startProduction();

    expect($mo->fresh()->status)->toBe('in_progress');
    expect($mo->fresh()->start_date)->not->toBeNull();
});

it('mo complete sets status done', function () {
    $mo = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $this->product->id,
        'qty_to_produce' => 50,
        'status'         => 'in_progress',
    ]);

    $mo->complete();

    expect($mo->fresh()->status)->toBe('done');
    expect($mo->fresh()->finish_date)->not->toBeNull();
});

it('mo cancel sets status cancelled', function () {
    $mo = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $this->product->id,
        'qty_to_produce' => 50,
        'status'         => 'confirmed',
    ]);

    $mo->cancel();

    expect($mo->fresh()->status)->toBe('cancelled');
});

it('fromBom populates components from bom lines', function () {
    $component = Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Widget Part',
        'sku'        => 'WP-' . uniqid(),
        'cost_price' => 3.00,
        'sale_price' => 6.00,
    ]);

    $bom = BillOfMaterials::create([
        'tenant_id'   => $this->tenant->id,
        'product_id'  => $this->product->id,
        'name'        => 'Widget BOM',
        'qty_per_bom' => 1,
    ]);

    BomLine::create([
        'bom_id'       => $bom->id,
        'component_id' => $component->id,
        'quantity'     => 3,
        'uom'          => 'kg',
    ]);

    // Refresh with lines
    $bom->load('lines');

    $mo = ManufacturingOrder::fromBom($bom, 10, $this->tenant->id);

    expect($mo->components()->count())->toBe(1);
    expect($mo->components()->first()->qty_required)->toBe(30.0); // 3 * 10
    expect($mo->components()->first()->product_id)->toBe($component->id);
});

// ========================
// Work Order Tests
// ========================

it('can create work order for mo', function () {
    $mo = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $this->product->id,
        'qty_to_produce' => 10,
    ]);

    $wc = WorkCenter::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Center',
    ]);

    $this->post("/manufacturing/manufacturing-orders/{$mo->id}/work-orders", [
        'work_center_id'    => $wc->id,
        'operation_name'    => 'Cutting',
        'sequence'          => 10,
        'duration_expected' => 60,
    ])->assertRedirect();

    expect(WorkOrder::where('manufacturing_order_id', $mo->id)->exists())->toBeTrue();
});

it('work order start and finish transitions work', function () {
    $mo = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $this->product->id,
        'qty_to_produce' => 10,
    ]);

    $wo = WorkOrder::create([
        'manufacturing_order_id' => $mo->id,
        'operation_name'         => 'Packaging',
        'sequence'               => 10,
        'duration_expected'      => 30,
        'status'                 => 'pending',
    ]);

    $wo->start();
    expect($wo->fresh()->status)->toBe('in_progress');
    expect($wo->fresh()->actual_start)->not->toBeNull();

    $wo->finish();
    expect($wo->fresh()->status)->toBe('done');
    expect($wo->fresh()->actual_finish)->not->toBeNull();
});

// ========================
// Dashboard & Reports
// ========================

it('manufacturing dashboard loads', function () {
    $this->get('/manufacturing/dashboard')->assertOk();
});

it('production output report loads', function () {
    $this->get('/manufacturing/reports/production-output')->assertOk();
});

it('bom cost report loads', function () {
    $this->get('/manufacturing/reports/bom-cost')->assertOk();
});

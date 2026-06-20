<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\Manufacturing\Models\ProductionSchedule;
use App\Modules\Manufacturing\Models\WorkCenter;
use App\Modules\Manufacturing\Models\WorkCenterCapacity;
use App\Modules\Manufacturing\Models\WorkOrder;
use App\Modules\Manufacturing\Models\ScrapOrder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SchedCorp', 'slug' => 'sched-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);

    // Shared work center
    $this->workCenter = WorkCenter::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Assembly Line A',
        'code'      => 'ALA-' . uniqid(),
        'is_active' => true,
    ]);

    // Shared product
    $this->product = Product::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Scheduled Product',
        'sku'        => 'SP-' . uniqid(),
        'cost_price' => 5.00,
        'sale_price' => 10.00,
    ]);

    // Shared manufacturing order
    $this->mo = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $this->product->id,
        'qty_to_produce' => 10,
        'status'         => 'in_progress',
    ]);

    // Shared work order
    $this->workOrder = WorkOrder::create([
        'manufacturing_order_id' => $this->mo->id,
        'work_center_id'         => $this->workCenter->id,
        'operation_name'         => 'Welding',
        'sequence'               => 1,
        'duration_expected'      => 120,
        'status'                 => 'pending',
    ]);
});

// 1. Shows gantt view
it('shows gantt view', function () {
    $this->get('/manufacturing/scheduling/gantt')->assertOk();
});

// 2. Creates a production schedule
it('creates a production schedule', function () {
    $this->post('/manufacturing/scheduling', [
        'work_order_id'   => $this->workOrder->id,
        'work_center_id'  => $this->workCenter->id,
        'scheduled_start' => '2027-02-01 08:00:00',
        'scheduled_end'   => '2027-02-01 10:00:00',
        'notes'           => 'Test schedule',
    ])->assertRedirect();

    expect(ProductionSchedule::where('work_order_id', $this->workOrder->id)->exists())->toBeTrue();
});

// 3. Rejects overlapping schedule for same work center
it('rejects overlapping schedule for same work center', function () {
    // First schedule
    ProductionSchedule::create([
        'tenant_id'      => $this->tenant->id,
        'work_order_id'  => $this->workOrder->id,
        'work_center_id' => $this->workCenter->id,
        'scheduled_start'=> '2027-02-05 08:00:00',
        'scheduled_end'  => '2027-02-05 12:00:00',
        'status'         => 'planned',
    ]);

    // Create another work order to schedule
    $wo2 = WorkOrder::create([
        'manufacturing_order_id' => $this->mo->id,
        'work_center_id'         => $this->workCenter->id,
        'operation_name'         => 'Painting',
        'sequence'               => 2,
        'duration_expected'      => 60,
        'status'                 => 'pending',
    ]);

    // Overlapping time window — same work center
    $response = $this->post('/manufacturing/scheduling', [
        'work_order_id'   => $wo2->id,
        'work_center_id'  => $this->workCenter->id,
        'scheduled_start' => '2027-02-05 09:00:00',
        'scheduled_end'   => '2027-02-05 11:00:00',
    ]);

    $response->assertStatus(422);
});

// 4. Confirms a schedule
it('confirms a schedule', function () {
    $schedule = ProductionSchedule::create([
        'tenant_id'       => $this->tenant->id,
        'work_order_id'   => $this->workOrder->id,
        'work_center_id'  => $this->workCenter->id,
        'scheduled_start' => '2027-03-01 08:00:00',
        'scheduled_end'   => '2027-03-01 10:00:00',
        'status'          => 'planned',
    ]);

    $this->post("/manufacturing/scheduling/{$schedule->id}/confirm")->assertRedirect();

    expect($schedule->fresh()->status)->toBe('confirmed');
});

// 5. Starts a schedule
it('starts a schedule', function () {
    $schedule = ProductionSchedule::create([
        'tenant_id'       => $this->tenant->id,
        'work_order_id'   => $this->workOrder->id,
        'work_center_id'  => $this->workCenter->id,
        'scheduled_start' => '2027-03-02 08:00:00',
        'scheduled_end'   => '2027-03-02 10:00:00',
        'status'          => 'confirmed',
    ]);

    $this->post("/manufacturing/scheduling/{$schedule->id}/start")->assertRedirect();

    expect($schedule->fresh()->status)->toBe('in_progress');
});

// 6. Completes a schedule
it('completes a schedule', function () {
    $schedule = ProductionSchedule::create([
        'tenant_id'       => $this->tenant->id,
        'work_order_id'   => $this->workOrder->id,
        'work_center_id'  => $this->workCenter->id,
        'scheduled_start' => '2027-03-03 08:00:00',
        'scheduled_end'   => '2027-03-03 10:00:00',
        'status'          => 'in_progress',
    ]);

    $this->post("/manufacturing/scheduling/{$schedule->id}/complete")->assertRedirect();

    expect($schedule->fresh()->status)->toBe('done');
});

// 7. Deletes a schedule
it('deletes a schedule', function () {
    $schedule = ProductionSchedule::create([
        'tenant_id'       => $this->tenant->id,
        'work_order_id'   => $this->workOrder->id,
        'work_center_id'  => $this->workCenter->id,
        'scheduled_start' => '2027-03-04 08:00:00',
        'scheduled_end'   => '2027-03-04 10:00:00',
        'status'          => 'planned',
    ]);

    $this->delete("/manufacturing/scheduling/{$schedule->id}")->assertRedirect();

    expect(ProductionSchedule::find($schedule->id))->toBeNull();
});

// 8. Shows shop floor
it('shows shop floor', function () {
    $this->get('/manufacturing/shop-floor')->assertOk();
});

// 9. Records scrap
it('records scrap', function () {
    $this->post('/manufacturing/scrap', [
        'product_id'             => $this->product->id,
        'quantity'               => 2.5,
        'uom'                    => 'pcs',
        'manufacturing_order_id' => $this->mo->id,
        'reason'                 => 'Defective parts',
    ])->assertRedirect();

    $scrap = ScrapOrder::where('product_id', $this->product->id)->first();
    expect($scrap)->not->toBeNull();
    expect($scrap->scrapped_at)->not->toBeNull();
});

// 10. Manages work center capacity
it('manages work center capacity', function () {
    $this->post('/manufacturing/capacity', [
        'work_center_id' => $this->workCenter->id,
        'day_of_week'    => 1,
        'start_time'     => '08:00',
        'end_time'       => '17:00',
    ])->assertRedirect();

    expect(WorkCenterCapacity::where('work_center_id', $this->workCenter->id)->exists())->toBeTrue();
});

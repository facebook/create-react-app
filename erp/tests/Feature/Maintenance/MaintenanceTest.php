<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Maintenance\Models\Equipment;
use App\Modules\Maintenance\Models\MaintenancePlan;
use App\Modules\Maintenance\Models\MaintenanceOrder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Maint Corp', 'slug' => 'maint-corp']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

function makeMaintEquipment(): Equipment
{
    return Equipment::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Test Machine ' . uniqid(),
        'category'  => 'machinery',
        'status'    => 'operational',
    ]);
}

function makeMaintPlan(?Equipment $equipment = null): MaintenancePlan
{
    $eq = $equipment ?? makeMaintEquipment();
    return MaintenancePlan::create([
        'tenant_id'    => test()->tenant->id,
        'equipment_id' => $eq->id,
        'name'         => 'Monthly Check ' . uniqid(),
        'frequency'    => 'monthly',
        'is_active'    => true,
        'next_due_at'  => now()->addMonth(),
    ]);
}

function makeMaintOrder(?Equipment $equipment = null): MaintenanceOrder
{
    $eq = $equipment ?? makeMaintEquipment();
    return MaintenanceOrder::create([
        'tenant_id'    => test()->tenant->id,
        'equipment_id' => $eq->id,
        'order_number' => 'MO-' . uniqid(),
        'type'         => 'preventive',
        'priority'     => 'medium',
        'status'       => 'open',
        'title'        => 'Test Order ' . uniqid(),
    ]);
}

it('maintenance dashboard renders', function () {
    $this->get('/maintenance/dashboard')->assertStatus(200);
});

it('equipment list renders', function () {
    $this->get('/maintenance/equipment')->assertStatus(200);
});

it('can create equipment', function () {
    $this->post('/maintenance/equipment', [
        'name'     => 'Air Compressor',
        'category' => 'machinery',
    ])->assertRedirect('/maintenance/equipment');

    expect(Equipment::withoutGlobalScopes()->where('name', 'Air Compressor')->exists())->toBeTrue();
});

it('equipment creation validates required fields', function () {
    $this->post('/maintenance/equipment', [])->assertSessionHasErrors(['name', 'category']);
});

it('plans list renders', function () {
    $this->get('/maintenance/plans')->assertStatus(200);
});

it('can create a maintenance plan with next_due_at set', function () {
    $eq = makeMaintEquipment();
    $this->post('/maintenance/plans', [
        'equipment_id' => $eq->id,
        'name'         => 'Oil Change',
        'frequency'    => 'monthly',
    ])->assertRedirect('/maintenance/plans');

    $plan = MaintenancePlan::withoutGlobalScopes()->where('name', 'Oil Change')->first();
    expect($plan)->not->toBeNull();
    expect($plan->next_due_at)->not->toBeNull();
});

it('orders list renders', function () {
    $this->get('/maintenance/orders')->assertStatus(200);
});

it('can create a maintenance order with generated order number', function () {
    $eq = makeMaintEquipment();
    $this->post('/maintenance/orders', [
        'equipment_id' => $eq->id,
        'type'         => 'preventive',
        'priority'     => 'medium',
        'title'        => 'Weekly Inspection',
    ])->assertRedirect('/maintenance/orders');

    $order = MaintenanceOrder::withoutGlobalScopes()->where('title', 'Weekly Inspection')->first();
    expect($order)->not->toBeNull();
    expect($order->order_number)->toStartWith('MO-');
});

it('order creation validates required fields', function () {
    $this->post('/maintenance/orders', [])->assertSessionHasErrors(['equipment_id', 'type', 'priority', 'title']);
});

it('can start a maintenance order', function () {
    $order = makeMaintOrder();
    $this->post("/maintenance/orders/{$order->id}/start")->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe('in_progress');
    expect($order->started_at)->not->toBeNull();
});

it('can complete a maintenance order', function () {
    $order = makeMaintOrder();
    $order->update(['status' => 'in_progress', 'started_at' => now()]);

    $this->post("/maintenance/orders/{$order->id}/complete", [
        'resolution'   => 'Replaced worn parts',
        'actual_hours' => 2.5,
        'cost'         => 150.00,
    ])->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe('completed');
    expect($order->resolution)->toBe('Replaced worn parts');
    expect($order->completed_at)->not->toBeNull();
});

it('completing order marks linked plan as performed', function () {
    $eq   = makeMaintEquipment();
    $plan = makeMaintPlan($eq);
    $order = MaintenanceOrder::create([
        'tenant_id'    => test()->tenant->id,
        'equipment_id' => $eq->id,
        'plan_id'      => $plan->id,
        'order_number' => 'MO-PLAN-' . uniqid(),
        'type'         => 'preventive',
        'priority'     => 'medium',
        'status'       => 'in_progress',
        'title'        => 'Planned Maintenance',
        'started_at'   => now(),
    ]);

    $this->post("/maintenance/orders/{$order->id}/complete", [
        'resolution'   => 'All tasks completed',
        'actual_hours' => 1.0,
    ])->assertRedirect();

    $plan->refresh();
    expect($plan->last_performed_at)->not->toBeNull();
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Repairs\Models\RepairLine;
use App\Modules\Repairs\Models\RepairOrder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Repair Corp', 'slug' => 'repair-corp']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

function makeRepairOrder(array $overrides = []): RepairOrder
{
    return RepairOrder::create(array_merge([
        'tenant_id'    => test()->tenant->id,
        'order_number' => 'RO-' . uniqid(),
        'product_name' => 'Test Device',
        'status'       => 'draft',
        'priority'     => 'medium',
    ], $overrides));
}

it('repair dashboard renders', function () {
    $this->get('/repairs/dashboard')->assertStatus(200);
});

it('repair orders index renders', function () {
    $this->get('/repairs/orders')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Repairs/Orders/Index'));
});

it('can create repair order', function () {
    $this->post('/repairs/orders', [
        'product_name' => 'Laptop Pro X',
        'priority'     => 'high',
    ])->assertRedirect();

    expect(RepairOrder::withoutGlobalScopes()->where('product_name', 'Laptop Pro X')->exists())->toBeTrue();
});

it('repair order show renders', function () {
    $order = makeRepairOrder();
    $this->get("/repairs/orders/{$order->id}")->assertStatus(200);
});

it('can confirm repair order', function () {
    $order = makeRepairOrder(['status' => 'draft']);
    $this->post("/repairs/orders/{$order->id}/confirm")->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe('confirmed');
});

it('can start repair order', function () {
    $order = makeRepairOrder(['status' => 'confirmed']);
    $this->post("/repairs/orders/{$order->id}/start")->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe('in_progress');
    expect($order->started_at)->not->toBeNull();
});

it('can complete repair order', function () {
    $order = makeRepairOrder(['status' => 'in_progress', 'started_at' => now()]);
    $this->post("/repairs/orders/{$order->id}/complete", [
        'actual_hours' => 2.5,
    ])->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe('done');
});

it('can cancel repair order', function () {
    $order = makeRepairOrder(['status' => 'draft']);
    $this->post("/repairs/orders/{$order->id}/cancel")->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe('cancelled');
});

it('can add a repair line', function () {
    $order = makeRepairOrder();
    $this->post("/repairs/orders/{$order->id}/lines", [
        'line_type'   => 'part',
        'description' => 'Replacement Screen',
        'quantity'    => 2,
        'unit_price'  => 50,
    ])->assertRedirect();

    expect(
        RepairLine::withoutGlobalScopes()
            ->where('repair_order_id', $order->id)
            ->where('description', 'Replacement Screen')
            ->exists()
    )->toBeTrue();
});

it('can remove a repair line', function () {
    $order = makeRepairOrder();
    $line = RepairLine::create([
        'tenant_id'       => test()->tenant->id,
        'repair_order_id' => $order->id,
        'line_type'       => 'labor',
        'description'     => 'Labor charge',
        'quantity'        => 1,
        'unit_price'      => 75,
        'total'           => 75,
    ]);

    $this->delete("/repairs/lines/{$line->id}")->assertRedirect();

    expect(RepairLine::withoutGlobalScopes()->find($line->id))->toBeNull();
});

it('store validates required fields', function () {
    $this->post('/repairs/orders', [])->assertSessionHasErrors(['product_name']);
});

it('isOverdue returns true for past scheduled date', function () {
    $order = makeRepairOrder([
        'scheduled_date' => now()->subDay()->toDateString(),
        'status'         => 'confirmed',
    ]);

    expect($order->isOverdue())->toBeTrue();
});

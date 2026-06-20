<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Subcontracting\Models\SubcontractOrder;
use App\Modules\Subcontracting\Models\SubcontractComponent;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Sub Co', 'slug' => 'sub-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

test('lists subcontract orders', function () {
    SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'reference'        => 'SC-001',
        'finished_product' => 'Widget',
        'finished_qty'     => 10,
        'unit_price'       => 5.00,
        'status'           => 'draft',
    ]);

    $this->get('/subcontracting/orders')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Subcontracting/Index'));
});

test('creates a subcontract order', function () {
    $this->post('/subcontracting/orders', [
        'reference'        => 'SC-CREATE-001',
        'finished_product' => 'Assembled Part',
        'finished_qty'     => 50,
        'unit_price'       => 12.50,
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(SubcontractOrder::where('reference', 'SC-CREATE-001')->exists())->toBeTrue();
});

test('shows a subcontract order', function () {
    $order = SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'reference'        => 'SC-SHOW-001',
        'finished_product' => 'Widget',
        'finished_qty'     => 10,
        'unit_price'       => 5.00,
        'status'           => 'draft',
    ]);

    $this->get("/subcontracting/orders/{$order->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Subcontracting/Show'));
});

test('sends order to vendor', function () {
    $order = SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'reference'        => 'SC-SEND-001',
        'finished_product' => 'Widget',
        'finished_qty'     => 10,
        'unit_price'       => 5.00,
        'status'           => 'draft',
    ]);

    $this->post("/subcontracting/orders/{$order->id}/send")
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order->refresh();
    expect($order->status)->toBe('sent');
    expect($order->sent_at)->not->toBeNull();
});

test('starts production', function () {
    $order = SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'reference'        => 'SC-START-001',
        'finished_product' => 'Widget',
        'finished_qty'     => 10,
        'unit_price'       => 5.00,
        'status'           => 'sent',
    ]);

    $this->post("/subcontracting/orders/{$order->id}/start-production")
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order->refresh();
    expect($order->status)->toBe('in_progress');
});

test('receives finished goods', function () {
    $order = SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'reference'        => 'SC-RECV-001',
        'finished_product' => 'Widget',
        'finished_qty'     => 10,
        'unit_price'       => 5.00,
        'status'           => 'in_progress',
    ]);

    $this->post("/subcontracting/orders/{$order->id}/receive")
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order->refresh();
    expect($order->status)->toBe('received');
    expect($order->received_at)->not->toBeNull();
});

test('cancels a subcontract order', function () {
    $order = SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'reference'        => 'SC-CANCEL-001',
        'finished_product' => 'Widget',
        'finished_qty'     => 10,
        'unit_price'       => 5.00,
        'status'           => 'draft',
    ]);

    $this->post("/subcontracting/orders/{$order->id}/cancel")
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order->refresh();
    expect($order->status)->toBe('cancelled');
});

test('adds a component to a draft order', function () {
    $order = SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'reference'        => 'SC-COMP-001',
        'finished_product' => 'Widget',
        'finished_qty'     => 10,
        'unit_price'       => 5.00,
        'status'           => 'draft',
    ]);

    $this->post("/subcontracting/orders/{$order->id}/components", [
        'component_name' => 'Steel Rod',
        'quantity'       => 2.5,
        'unit'           => 'kg',
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(
        SubcontractComponent::where('subcontract_id', $order->id)
            ->where('component_name', 'Steel Rod')
            ->exists()
    )->toBeTrue();
});

test('removes a component from a draft order', function () {
    $order = SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'reference'        => 'SC-RMCOMP-001',
        'finished_product' => 'Widget',
        'finished_qty'     => 10,
        'unit_price'       => 5.00,
        'status'           => 'draft',
    ]);

    $component = SubcontractComponent::create([
        'subcontract_id' => $order->id,
        'tenant_id'      => $this->tenant->id,
        'component_name' => 'Bolt',
        'quantity'       => 4,
        'unit'           => 'pcs',
    ]);

    $this->delete("/subcontracting/orders/{$order->id}/components/{$component->id}")
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(SubcontractComponent::find($component->id))->toBeNull();
});

test('computes total cost correctly', function () {
    $order = SubcontractOrder::create([
        'tenant_id'        => $this->tenant->id,
        'reference'        => 'SC-COST-001',
        'finished_product' => 'Widget',
        'finished_qty'     => 10,
        'unit_price'       => 25.00,
        'status'           => 'draft',
    ]);

    expect($order->totalCost())->toBe(250.0);
});

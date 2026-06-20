<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Shipment;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ShipCorp', 'slug' => 'ship-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeShipment(array $attrs = []): Shipment
{
    return Shipment::create([
        'tenant_id'  => test()->tenant->id,
        'type'       => 'outbound',
        'carrier'    => 'FedEx',
        'created_by' => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/shipments')->assertRedirect('/login');
});

it('admin can list shipments', function () {
    makeShipment();
    $this->get('/inventory/shipments')->assertOk();
});

it('store creates a shipment', function () {
    $this->post('/inventory/shipments', [
        'type'    => 'outbound',
        'carrier' => 'DHL',
    ])->assertRedirect();

    expect(Shipment::where('carrier', 'DHL')->exists())->toBeTrue();
});

it('store validates type', function () {
    $this->postJson('/inventory/shipments', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['type']);
});

it('store rejects invalid type', function () {
    $this->postJson('/inventory/shipments', ['type' => 'sideways'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['type']);
});

it('show displays a shipment', function () {
    $shipment = makeShipment();
    $this->get("/inventory/shipments/{$shipment->id}")->assertOk();
});

it('dispatch transitions to in-transit', function () {
    $shipment = makeShipment();
    expect($shipment->status)->toBe('pending');
    expect($shipment->is_pending)->toBeTrue();

    $this->post("/inventory/shipments/{$shipment->id}/dispatch")->assertRedirect();

    $shipment->refresh();
    expect($shipment->status)->toBe('in-transit');
    expect($shipment->is_in_transit)->toBeTrue();
    expect($shipment->shipment_number)->toMatch('/^SHO-\d{4}-\d{5}$/');
});

it('dispatch sets ship_date when missing', function () {
    $shipment = makeShipment();
    expect($shipment->ship_date)->toBeNull();
    $this->post("/inventory/shipments/{$shipment->id}/dispatch")->assertRedirect();
    expect($shipment->fresh()->ship_date)->not->toBeNull();
});

it('deliver transitions to delivered', function () {
    $shipment = makeShipment(['status' => 'in-transit']);
    $this->post("/inventory/shipments/{$shipment->id}/deliver")->assertRedirect();
    $shipment->refresh();
    expect($shipment->status)->toBe('delivered');
    expect($shipment->is_delivered)->toBeTrue();
    expect($shipment->actual_delivery)->not->toBeNull();
});

it('return transitions to returned', function () {
    $shipment = makeShipment(['status' => 'in-transit']);
    $this->post("/inventory/shipments/{$shipment->id}/return")->assertRedirect();
    expect($shipment->fresh()->status)->toBe('returned');
});

it('cancel transitions to cancelled', function () {
    $shipment = makeShipment();
    $this->post("/inventory/shipments/{$shipment->id}/cancel")->assertRedirect();
    expect($shipment->fresh()->status)->toBe('cancelled');
});

it('inbound shipment number uses SHI prefix', function () {
    $shipment = makeShipment(['type' => 'inbound']);
    $shipment->dispatch();
    expect($shipment->shipment_number)->toMatch('/^SHI-\d{4}-\d{5}$/');
});

it('update modifies carrier and tracking', function () {
    $shipment = makeShipment();
    $this->put("/inventory/shipments/{$shipment->id}", [
        'carrier'         => 'UPS',
        'tracking_number' => 'TRACK123',
    ])->assertRedirect();

    $shipment->refresh();
    expect($shipment->carrier)->toBe('UPS');
    expect($shipment->tracking_number)->toBe('TRACK123');
});

it('destroy soft-deletes the shipment', function () {
    $shipment = makeShipment();
    $this->delete("/inventory/shipments/{$shipment->id}")->assertRedirect();
    expect(Shipment::find($shipment->id))->toBeNull();
    expect(Shipment::withTrashed()->find($shipment->id))->not->toBeNull();
});

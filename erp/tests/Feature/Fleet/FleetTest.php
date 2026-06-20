<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Fleet\Models\FuelLog;
use App\Modules\Fleet\Models\Vehicle;
use App\Modules\Fleet\Models\VehicleMaintenance;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Fleet Corp', 'slug' => 'fleet-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeFleetVehicle(array $attrs = []): Vehicle
{
    return Vehicle::create(array_merge([
        'tenant_id'   => test()->tenant->id,
        'name'        => 'Test Vehicle ' . uniqid(),
        'type'        => 'car',
        'status'      => 'active',
        'fuel_type'   => 'petrol',
        'odometer_km' => 0,
    ], $attrs));
}

function makeFleetFuelLog(Vehicle $vehicle, array $attrs = []): FuelLog
{
    return FuelLog::create(array_merge([
        'tenant_id'      => test()->tenant->id,
        'vehicle_id'     => $vehicle->id,
        'log_date'       => now()->toDateString(),
        'odometer_km'    => 10000,
        'liters'         => 50,
        'cost_per_liter' => 1.5,
        'total_cost'     => 75,
    ], $attrs));
}

function makeFleetMaintenance(Vehicle $vehicle, array $attrs = []): VehicleMaintenance
{
    return VehicleMaintenance::create(array_merge([
        'tenant_id'    => test()->tenant->id,
        'vehicle_id'   => $vehicle->id,
        'type'         => 'scheduled',
        'service_date' => now()->toDateString(),
        'cost'         => 100,
        'status'       => 'scheduled',
    ], $attrs));
}

// ---- Dashboard ----

it('renders fleet dashboard', function () {
    $this->get('/fleet/dashboard')->assertOk();
});

// ---- Vehicles ----

it('renders vehicles index', function () {
    $this->get('/fleet/vehicles')->assertOk();
});

it('renders vehicles create page', function () {
    $this->get('/fleet/vehicles/create')->assertOk();
});

it('stores a vehicle', function () {
    $this->post('/fleet/vehicles', [
        'name'      => 'Toyota Hilux #1',
        'type'      => 'truck',
        'status'    => 'active',
        'fuel_type' => 'diesel',
    ])->assertRedirect();

    expect(Vehicle::where('name', 'Toyota Hilux #1')->exists())->toBeTrue();
});

it('shows a vehicle', function () {
    $vehicle = makeFleetVehicle();
    $this->get("/fleet/vehicles/{$vehicle->id}")->assertOk();
});

it('renders vehicle edit page', function () {
    $vehicle = makeFleetVehicle();
    $this->get("/fleet/vehicles/{$vehicle->id}/edit")->assertOk();
});

it('updates a vehicle', function () {
    $vehicle = makeFleetVehicle();
    $this->put("/fleet/vehicles/{$vehicle->id}", [
        'name'      => 'Updated Vehicle',
        'type'      => 'van',
        'status'    => 'in_service',
        'fuel_type' => 'diesel',
    ])->assertRedirect();

    expect($vehicle->fresh()->name)->toBe('Updated Vehicle');
    expect($vehicle->fresh()->status)->toBe('in_service');
});

it('destroys a vehicle', function () {
    $vehicle = makeFleetVehicle();
    $this->delete("/fleet/vehicles/{$vehicle->id}")->assertRedirect();

    expect(Vehicle::find($vehicle->id))->toBeNull();
});

// ---- Fuel Logs ----

it('renders fuel logs index', function () {
    $this->get('/fleet/fuel-logs')->assertOk();
});

it('stores a fuel log and auto-calculates total_cost', function () {
    $vehicle = makeFleetVehicle();
    $this->post('/fleet/fuel-logs', [
        'vehicle_id'     => $vehicle->id,
        'log_date'       => now()->toDateString(),
        'odometer_km'    => 12000,
        'liters'         => 40,
        'cost_per_liter' => 1.75,
    ])->assertRedirect();

    $log = FuelLog::where('vehicle_id', $vehicle->id)->first();
    expect($log)->not->toBeNull();
    expect($log->total_cost)->toBe(70.0);
});

it('destroys a fuel log', function () {
    $vehicle = makeFleetVehicle();
    $log     = makeFleetFuelLog($vehicle);
    $this->delete("/fleet/fuel-logs/{$log->id}")->assertRedirect();

    expect(FuelLog::find($log->id))->toBeNull();
});

// ---- Maintenances ----

it('renders maintenances index', function () {
    $this->get('/fleet/maintenances')->assertOk();
});

it('stores a maintenance record', function () {
    $vehicle = makeFleetVehicle();
    $this->post('/fleet/maintenances', [
        'vehicle_id'   => $vehicle->id,
        'type'         => 'repair',
        'service_date' => now()->toDateString(),
        'status'       => 'scheduled',
    ])->assertRedirect();

    expect(VehicleMaintenance::where('vehicle_id', $vehicle->id)->exists())->toBeTrue();
});

it('completes a maintenance record', function () {
    $vehicle     = makeFleetVehicle();
    $maintenance = makeFleetMaintenance($vehicle, ['status' => 'in_progress']);
    $this->post("/fleet/maintenances/{$maintenance->id}/complete")->assertRedirect();

    expect($maintenance->fresh()->status)->toBe('completed');
});

it('destroys a maintenance record', function () {
    $vehicle     = makeFleetVehicle();
    $maintenance = makeFleetMaintenance($vehicle);
    $this->delete("/fleet/maintenances/{$maintenance->id}")->assertRedirect();

    expect(VehicleMaintenance::find($maintenance->id))->toBeNull();
});

// ---- Dashboard Stats ----

it('expiring insurance appears in dashboard stats', function () {
    makeFleetVehicle([
        'insurance_expiry' => now()->addDays(10)->toDateString(),
        'status'           => 'active',
    ]);

    $response = $this->get('/fleet/dashboard');
    $response->assertOk();

    $stats = $response->original->getData()['page']['props']['stats'];
    expect($stats['expiringInsurance'])->toBeGreaterThanOrEqual(1);
});

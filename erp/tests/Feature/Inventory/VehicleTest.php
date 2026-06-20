<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Vehicle;
use App\Modules\Inventory\Models\VehicleLog;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Fleet Corp', 'slug' => 'fleet-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeFleetEmployee(): Employee {
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'first_name' => 'Fleet',
        'last_name'  => 'Driver',
        'email'      => 'fleet_' . uniqid() . '@example.com',
        'status'     => 'active',
        'hire_date'  => now()->toDateString(),
    ]);
}

function makeVehicle(?string $registration = null): Vehicle {
    return Vehicle::create([
        'tenant_id'    => test()->tenant->id,
        'registration' => $registration ?? 'ABC-' . rand(1000, 9999),
        'make'         => 'Toyota',
        'model'        => 'Hilux',
        'year'         => 2022,
        'fuel_type'    => 'diesel',
        'odometer_km'  => 15000,
        'status'       => 'available',
    ]);
}

it('admin can list vehicles', function () {
    $this->get('/inventory/vehicles')->assertStatus(200);
});

it('admin can create a vehicle', function () {
    $this->post('/inventory/vehicles', [
        'registration' => 'XYZ-9999',
        'make'         => 'Ford',
        'model'        => 'Ranger',
        'year'         => 2023,
        'fuel_type'    => 'diesel',
        'odometer_km'  => 0,
    ])->assertRedirect();
    expect(Vehicle::where('registration', 'XYZ-9999')->exists())->toBeTrue();
});

it('vehicle store requires registration make and model', function () {
    $this->postJson('/inventory/vehicles', ['registration' => '', 'make' => '', 'model' => ''])
        ->assertStatus(422)->assertJsonValidationErrors(['registration', 'make', 'model']);
});

it('admin can view a vehicle', function () {
    $vehicle = makeVehicle();
    $this->get("/inventory/vehicles/{$vehicle->id}")->assertStatus(200);
});

it('admin can assign a vehicle to an employee', function () {
    $vehicle  = makeVehicle();
    $employee = makeFleetEmployee();
    $this->patch("/inventory/vehicles/{$vehicle->id}/assign", [
        'employee_id' => $employee->id,
    ])->assertRedirect();
    $vehicle->refresh();
    expect($vehicle->status)->toBe('in_use');
    expect($vehicle->assigned_to_employee_id)->toBe($employee->id);
});

it('admin can unassign a vehicle', function () {
    $vehicle  = makeVehicle();
    $employee = makeFleetEmployee();
    $vehicle->assign($employee->id);
    $this->patch("/inventory/vehicles/{$vehicle->id}/unassign")->assertRedirect();
    expect($vehicle->fresh()->status)->toBe('available');
    expect($vehicle->fresh()->assigned_to_employee_id)->toBeNull();
});

it('admin can add a trip log', function () {
    $vehicle = makeVehicle();
    $this->post("/inventory/vehicles/{$vehicle->id}/logs", [
        'log_type'       => 'trip',
        'log_date'       => now()->toDateString(),
        'driver_name'    => 'John Doe',
        'destination'    => 'Nairobi',
        'odometer_start' => 15000,
        'odometer_end'   => 15200,
        'distance_km'    => 200,
    ])->assertRedirect();
    expect($vehicle->logs()->count())->toBe(1);
});

it('fuel_efficiency accessor calculates correctly', function () {
    $vehicle = makeVehicle();
    $log = VehicleLog::create([
        'tenant_id'   => test()->tenant->id,
        'vehicle_id'  => $vehicle->id,
        'log_type'    => 'refuel',
        'log_date'    => now()->toDateString(),
        'distance_km' => 300,
        'fuel_litres' => 30,
    ]);
    expect($log->fuel_efficiency)->toBe(10.0);
});

it('admin can retire a vehicle', function () {
    $vehicle = makeVehicle();
    $this->post("/inventory/vehicles/{$vehicle->id}/retire")->assertRedirect();
    expect($vehicle->fresh()->status)->toBe('retired');
});

it('staff cannot delete a vehicle', function () {
    $vehicle = makeVehicle();
    $this->actingAs($this->staff)
        ->delete("/inventory/vehicles/{$vehicle->id}")
        ->assertStatus(403);
});

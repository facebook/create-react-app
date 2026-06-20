<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Fleet\Models\FuelLog;
use App\Modules\Fleet\Models\Vehicle;
use App\Modules\Fleet\Models\VehicleAssignment;
use Illuminate\Database\Seeder;

class FleetSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $userId = \App\Models\User::first()->id ?? 1;

        $van = Vehicle::create([
            'tenant_id'           => $tenant->id,
            'name'                => 'Delivery Van 01',
            'plate_number'        => 'DLV-1001',
            'make'                => 'Ford',
            'model'               => 'Transit',
            'year'                => 2021,
            'color'               => 'White',
            'type'                => 'van',
            'status'              => 'active',
            'fuel_type'           => 'diesel',
            'odometer_km'         => 34200.0,
            'insurance_expiry'    => now()->addMonths(8)->toDateString(),
            'registration_expiry' => now()->addMonths(5)->toDateString(),
        ]);

        $car = Vehicle::create([
            'tenant_id'           => $tenant->id,
            'name'                => 'Executive Sedan 01',
            'plate_number'        => 'EXC-2201',
            'make'                => 'Toyota',
            'model'               => 'Camry',
            'year'                => 2022,
            'color'               => 'Silver',
            'type'                => 'car',
            'status'              => 'active',
            'fuel_type'           => 'petrol',
            'odometer_km'         => 18500.0,
            'insurance_expiry'    => now()->addYear()->toDateString(),
            'registration_expiry' => now()->addMonths(10)->toDateString(),
            'assigned_to'         => $userId,
        ]);

        VehicleAssignment::create([
            'tenant_id'      => $tenant->id,
            'vehicle_id'     => $van->id,
            'driver_id'      => $userId,
            'purpose'        => 'Client deliveries – North District',
            'assigned_at'    => now()->subDays(1),
            'start_odometer' => 34000.0,
        ]);

        FuelLog::create([
            'tenant_id'      => $tenant->id,
            'vehicle_id'     => $van->id,
            'log_date'       => now()->subDays(3)->toDateString(),
            'odometer_km'    => 33850.0,
            'liters'         => 55.00,
            'cost_per_liter' => 1.620,
            'total_cost'     => 89.10,
            'fuel_type'      => 'diesel',
            'station'        => 'Shell – Highway North',
            'driver_id'      => $userId,
        ]);

        FuelLog::create([
            'tenant_id'      => $tenant->id,
            'vehicle_id'     => $car->id,
            'log_date'       => now()->subDays(5)->toDateString(),
            'odometer_km'    => 18350.0,
            'liters'         => 42.50,
            'cost_per_liter' => 1.750,
            'total_cost'     => 74.38,
            'fuel_type'      => 'petrol',
            'station'        => 'BP City Centre',
            'driver_id'      => $userId,
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Maintenance\Models\Equipment;
use App\Modules\Maintenance\Models\MaintenanceOrder;
use App\Modules\Maintenance\Models\MaintenancePlan;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $userId = \App\Models\User::first()->id ?? 1;

        $compressor = Equipment::create([
            'tenant_id'     => $tenant->id,
            'name'          => 'Air Compressor Unit A',
            'code'          => 'EQ-COMP-001',
            'category'      => 'machinery',
            'location'      => 'Production Hall – Bay 3',
            'serial_number' => 'AC-20219-XR',
            'manufacturer'  => 'Atlas Copco',
            'model'         => 'GA37+',
            'purchase_date' => '2021-06-15',
            'warranty_expiry' => '2024-06-15',
            'status'        => 'operational',
        ]);

        $hvac = Equipment::create([
            'tenant_id'     => $tenant->id,
            'name'          => 'Rooftop HVAC Unit',
            'code'          => 'EQ-HVAC-001',
            'category'      => 'hvac',
            'location'      => 'Rooftop – Zone B',
            'serial_number' => 'HV-88234-ZT',
            'manufacturer'  => 'Carrier',
            'model'         => '50XC060',
            'purchase_date' => '2020-03-10',
            'warranty_expiry' => '2023-03-10',
            'status'        => 'operational',
            'assigned_to'   => $userId,
        ]);

        $plan = MaintenancePlan::create([
            'tenant_id'                => $tenant->id,
            'equipment_id'             => $compressor->id,
            'name'                     => 'Monthly Compressor Service',
            'frequency'                => 'monthly',
            'estimated_duration_hours' => 2.50,
            'description'              => 'Check oil levels, replace filters, inspect belts and safety valves.',
            'is_active'                => true,
            'last_performed_at'        => now()->subMonth(),
            'next_due_at'              => now()->addDays(5),
        ]);

        MaintenanceOrder::create([
            'tenant_id'      => $tenant->id,
            'equipment_id'   => $compressor->id,
            'plan_id'        => $plan->id,
            'order_number'   => 'MO-00001',
            'type'           => 'preventive',
            'priority'       => 'medium',
            'status'         => 'open',
            'title'          => 'Monthly Service – Air Compressor Unit A',
            'description'    => 'Perform scheduled monthly service including filter replacement and oil check.',
            'scheduled_date' => now()->addDays(5)->toDateString(),
            'estimated_hours' => 2.50,
            'assigned_to'    => $userId,
            'reported_by'    => $userId,
        ]);

        MaintenanceOrder::create([
            'tenant_id'      => $tenant->id,
            'equipment_id'   => $hvac->id,
            'order_number'   => 'MO-00002',
            'type'           => 'corrective',
            'priority'       => 'high',
            'status'         => 'completed',
            'title'          => 'HVAC Refrigerant Leak Repair',
            'description'    => 'Unit reported insufficient cooling. Diagnosed refrigerant leak at evaporator coil joint.',
            'scheduled_date' => now()->subDays(4)->toDateString(),
            'started_at'     => now()->subDays(4)->setHour(9),
            'completed_at'   => now()->subDays(4)->setHour(13),
            'estimated_hours' => 3.00,
            'actual_hours'   => 4.00,
            'assigned_to'    => $userId,
            'reported_by'    => $userId,
            'cost'           => 320.00,
            'resolution'     => 'Replaced evaporator coil joint seals and recharged refrigerant to spec. Tested for 30 minutes — no further leaks detected.',
        ]);
    }
}

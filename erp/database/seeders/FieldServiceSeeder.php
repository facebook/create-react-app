<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\FieldService\Models\ServiceOrder;
use Illuminate\Database\Seeder;

class FieldServiceSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $userId = \App\Models\User::first()->id ?? 1;

        ServiceOrder::create([
            'tenant_id'         => $tenant->id,
            'title'             => 'HVAC System Installation',
            'type'              => 'installation',
            'priority'          => 'high',
            'status'            => 'pending',
            'customer_name'     => 'Riverside Office Park',
            'customer_email'    => 'facilities@riverside.example',
            'customer_phone'    => '+1-555-0101',
            'address'           => '450 Riverside Blvd, Suite 200',
            'scheduled_at'      => now()->addDays(3),
            'estimated_duration' => 240,
            'created_by'        => $userId,
        ]);

        ServiceOrder::create([
            'tenant_id'         => $tenant->id,
            'title'             => 'Elevator Quarterly Inspection',
            'type'              => 'inspection',
            'priority'          => 'medium',
            'status'            => 'in_progress',
            'customer_name'     => 'Apex Tower Management',
            'customer_email'    => 'maintenance@apextower.example',
            'customer_phone'    => '+1-555-0202',
            'address'           => '1 Apex Tower, Floor 1',
            'scheduled_at'      => now()->subHours(2),
            'started_at'        => now()->subHours(1),
            'estimated_duration' => 120,
            'assigned_to'       => $userId,
            'created_by'        => $userId,
        ]);

        ServiceOrder::create([
            'tenant_id'         => $tenant->id,
            'title'             => 'Network Equipment Repair',
            'type'              => 'repair',
            'priority'          => 'urgent',
            'status'            => 'completed',
            'customer_name'     => 'Metro Data Center',
            'customer_email'    => 'ops@metrodc.example',
            'customer_phone'    => '+1-555-0303',
            'address'           => '800 Data Center Dr',
            'scheduled_at'      => now()->subDays(2),
            'started_at'        => now()->subDays(2)->addHour(),
            'completed_at'      => now()->subDays(2)->addHours(3),
            'estimated_duration' => 90,
            'actual_duration'   => 105,
            'assigned_to'       => $userId,
            'created_by'        => $userId,
            'notes'             => 'Replaced faulty switch module. Tested all ports.',
        ]);
    }
}

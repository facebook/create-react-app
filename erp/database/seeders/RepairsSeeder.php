<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Repairs\Models\RepairOrder;
use Illuminate\Database\Seeder;

class RepairsSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Repair order — draft, awaiting diagnosis
        RepairOrder::create([
            'tenant_id'      => $tenant->id,
            'order_number'   => 'RO-00001',
            'product_name'   => 'Dell XPS 15 Laptop',
            'serial_number'  => 'DXPS15-2023-00112',
            'status'         => 'draft',
            'priority'       => 'medium',
            'diagnosis'      => null,
            'warranty_claim' => false,
            'scheduled_date' => '2026-07-05',
            'estimated_hours' => 2.50,
            'estimated_cost'  => 150.00,
        ]);

        // Repair order — confirmed and in progress
        RepairOrder::create([
            'tenant_id'      => $tenant->id,
            'order_number'   => 'RO-00002',
            'product_name'   => 'HP LaserJet Pro Printer',
            'serial_number'  => 'HPLJ-MFP-0078',
            'status'         => 'in_progress',
            'priority'       => 'high',
            'diagnosis'      => 'Paper feed roller worn out; toner cartridge leaking.',
            'internal_notes' => 'Customer needs unit back by Friday.',
            'warranty_claim' => true,
            'scheduled_date' => '2026-07-03',
            'started_at'     => '2026-07-03 09:00:00',
            'estimated_hours' => 1.50,
            'estimated_cost'  => 80.00,
        ]);

        // Repair order — completed
        RepairOrder::create([
            'tenant_id'      => $tenant->id,
            'order_number'   => 'RO-00003',
            'product_name'   => 'iPhone 14 Pro',
            'serial_number'  => 'IPHN14P-XR-4421',
            'status'         => 'done',
            'priority'       => 'urgent',
            'diagnosis'      => 'Cracked screen and non-functional front camera.',
            'internal_notes' => 'Replaced OLED display assembly and camera module.',
            'warranty_claim' => false,
            'scheduled_date' => '2026-06-28',
            'started_at'     => '2026-06-28 10:30:00',
            'completed_at'   => '2026-06-28 14:00:00',
            'estimated_hours' => 3.00,
            'actual_hours'    => 3.50,
            'estimated_cost'  => 250.00,
            'final_cost'      => 275.00,
        ]);
    }
}

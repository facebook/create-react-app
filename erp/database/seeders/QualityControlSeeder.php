<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\QualityControl\Models\QcChecklist;
use App\Modules\QualityControl\Models\QcInspection;
use Illuminate\Database\Seeder;

class QualityControlSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $checklist = QcChecklist::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Incoming Goods Inspection',
            'description' => 'Standard checklist applied to all incoming shipments from vendors.',
            'category'    => 'incoming',
            'is_active'   => true,
        ]);

        QcInspection::create([
            'tenant_id'    => $tenant->id,
            'checklist_id' => $checklist->id,
            'reference_type'=> 'purchase_orders',
            'reference_id' => 1,
            'status'       => 'passed',
            'notes'        => 'All units within tolerance. Approved for stocking.',
            'started_at'   => now()->subDays(5),
            'completed_at' => now()->subDays(5)->addHours(2),
        ]);

        QcInspection::create([
            'tenant_id'    => $tenant->id,
            'checklist_id' => $checklist->id,
            'reference_type'=> 'manufacturing_orders',
            'reference_id' => 1,
            'status'       => 'pending',
            'notes'        => 'Scheduled for end-of-run quality gate.',
        ]);
    }
}

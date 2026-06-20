<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Subcontracting\Models\SubcontractOrder;
use Illuminate\Database\Seeder;

class SubcontractingSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Subcontract order — sent to vendor, awaiting production
        SubcontractOrder::create([
            'tenant_id'        => $tenant->id,
            'reference'        => 'SUB-2026-0001',
            'status'           => 'sent',
            'finished_product' => 'Custom Steel Bracket Assembly',
            'finished_qty'     => 200.00,
            'unit_price'       => 12.50,
            'notes'            => 'ISO 9001-compliant finish required. Delivery by 15 July 2026.',
            'sent_at'          => '2026-06-18 09:30:00',
        ]);

        // Subcontract order — in production
        SubcontractOrder::create([
            'tenant_id'        => $tenant->id,
            'reference'        => 'SUB-2026-0002',
            'status'           => 'in_progress',
            'finished_product' => 'Injection-Moulded Casing (Type B)',
            'finished_qty'     => 500.00,
            'unit_price'       => 4.75,
            'notes'            => 'Black ABS plastic, wall thickness 2 mm. Packaging: 50 units per box.',
            'sent_at'          => '2026-06-10 11:00:00',
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use Illuminate\Database\Seeder;

class ManufacturingSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $product = Product::where('tenant_id', $tenant->id)->first();

        if (! $product) {
            return;
        }

        ManufacturingOrder::create([
            'tenant_id'      => $tenant->id,
            'mo_number'      => 'MO-2026-00001',
            'product_id'     => $product->id,
            'qty_to_produce' => 100,
            'qty_produced'   => 0,
            'status'         => 'confirmed',
            'scheduled_date' => '2026-07-01',
            'notes'          => 'First production run for Q3.',
        ]);

        ManufacturingOrder::create([
            'tenant_id'      => $tenant->id,
            'mo_number'      => 'MO-2026-00002',
            'product_id'     => $product->id,
            'qty_to_produce' => 250,
            'qty_produced'   => 120,
            'status'         => 'in_progress',
            'scheduled_date' => '2026-07-15',
            'start_date'     => '2026-07-15',
            'notes'          => 'Mid-quarter replenishment batch.',
        ]);
    }
}

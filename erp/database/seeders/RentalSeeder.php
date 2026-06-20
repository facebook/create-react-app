<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Rental\Models\RentalAgreement;
use App\Modules\Rental\Models\RentalItem;
use Illuminate\Database\Seeder;

class RentalSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $item1 = RentalItem::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Forklift — Model FX-200',
            'description' => 'Electric forklift, 2-ton capacity, suitable for warehouse use.',
            'category'    => 'Heavy Equipment',
            'daily_rate'  => 120.00,
            'status'      => 'rented',
            'serial_number'=> 'FX200-2024-001',
        ]);

        $item2 = RentalItem::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Portable Generator — 10kW',
            'description' => 'Diesel generator for temporary power needs on job sites.',
            'category'    => 'Power Equipment',
            'daily_rate'  => 75.00,
            'status'      => 'available',
            'serial_number'=> 'GEN10K-2023-047',
        ]);

        RentalAgreement::create([
            'tenant_id'     => $tenant->id,
            'rental_item_id'=> $item1->id,
            'customer_name' => 'BuildRight Construction',
            'customer_email'=> 'rentals@buildright.example',
            'start_date'    => '2026-06-10',
            'end_date'      => '2026-06-30',
            'daily_rate'    => 120.00,
            'deposit'       => 500.00,
            'status'        => 'active',
            'notes'         => 'Forklift needed for warehouse fit-out project.',
        ]);

        RentalAgreement::create([
            'tenant_id'     => $tenant->id,
            'rental_item_id'=> $item2->id,
            'customer_name' => 'EventPro Ltd.',
            'customer_email'=> 'ops@eventpro.example',
            'start_date'    => '2026-05-20',
            'end_date'      => '2026-05-25',
            'daily_rate'    => 75.00,
            'deposit'       => 200.00,
            'status'        => 'returned',
            'notes'         => 'Generator for outdoor festival. Returned in good condition.',
            'returned_at'   => '2026-05-25 18:00:00',
        ]);
    }
}

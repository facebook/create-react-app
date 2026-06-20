<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\POS\Models\PosOrder;
use App\Modules\POS\Models\PosSession;
use Illuminate\Database\Seeder;

class PosSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $session = PosSession::create([
            'tenant_id'    => $tenant->id,
            'name'         => 'POS-2026-00001',
            'status'       => 'open',
            'opened_at'    => now()->startOfDay()->addHours(8),
            'opening_cash' => 200.00,
            'total_sales'  => 0,
            'total_refunds'=> 0,
        ]);

        PosOrder::create([
            'tenant_id'      => $tenant->id,
            'session_id'     => $session->id,
            'receipt_number' => 'REC-2026-00001',
            'customer_name'  => 'Walk-in Customer',
            'subtotal'       => 85.00,
            'discount_amount'=> 0.00,
            'tax_amount'     => 8.50,
            'total'          => 93.50,
            'amount_paid'    => 100.00,
            'change_given'   => 6.50,
            'payment_method' => 'cash',
            'status'         => 'completed',
        ]);

        PosOrder::create([
            'tenant_id'      => $tenant->id,
            'session_id'     => $session->id,
            'receipt_number' => 'REC-2026-00002',
            'customer_name'  => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'subtotal'       => 142.00,
            'discount_amount'=> 10.00,
            'tax_amount'     => 13.20,
            'total'          => 145.20,
            'amount_paid'    => 145.20,
            'change_given'   => 0.00,
            'payment_method' => 'card',
            'status'         => 'completed',
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Purchase\Models\Po;
use App\Modules\Purchase\Models\PurchaseRfq;
use App\Modules\Purchase\Models\PurchaseVendor;
use Illuminate\Database\Seeder;

class PurchaseSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $vendor1 = PurchaseVendor::create([
            'tenant_id'     => $tenant->id,
            'name'          => 'Global Parts Supply Co.',
            'email'         => 'orders@globalparts.example',
            'phone'         => '+1-800-555-0101',
            'address'       => '123 Industrial Way, Chicago, IL 60601',
            'currency'      => 'USD',
            'payment_terms' => 'Net 30',
            'is_active'     => true,
            'rating'        => 4,
        ]);

        $vendor2 = PurchaseVendor::create([
            'tenant_id'     => $tenant->id,
            'name'          => 'FastShip Logistics Ltd.',
            'email'         => 'procurement@fastship.example',
            'phone'         => '+1-800-555-0202',
            'address'       => '456 Commerce Blvd, Dallas, TX 75201',
            'currency'      => 'USD',
            'payment_terms' => 'Net 15',
            'is_active'     => true,
            'rating'        => 5,
        ]);

        $rfq = PurchaseRfq::create([
            'tenant_id'         => $tenant->id,
            'rfq_number'        => 'RFQ-2026-00001',
            'po_vendor_id'      => $vendor1->id,
            'status'            => 'sent',
            'expected_delivery' => '2026-07-20',
            'currency'          => 'USD',
            'notes'             => 'Requesting quote for Q3 raw material stock.',
            'sent_at'           => now(),
        ]);

        Po::create([
            'tenant_id'         => $tenant->id,
            'po_number'         => 'PO-20260619-0001',
            'po_rfq_id'         => $rfq->id,
            'po_vendor_id'      => $vendor1->id,
            'status'            => 'confirmed',
            'order_date'        => '2026-06-19',
            'expected_delivery' => '2026-07-20',
            'currency'          => 'USD',
            'total_amount'      => 4750.00,
            'notes'             => 'Standard Q3 raw material purchase order.',
            'confirmed_at'      => now(),
        ]);
    }
}

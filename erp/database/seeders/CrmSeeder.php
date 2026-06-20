<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\CRM\Models\CrmLead;
use Illuminate\Database\Seeder;

class CrmSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Open lead
        CrmLead::create([
            'tenant_id'            => $tenant->id,
            'title'                => 'Enterprise Software Suite Inquiry',
            'type'                 => 'lead',
            'contact_name'         => 'Alice Mercer',
            'company_name'         => 'BlueSky Technologies',
            'email'                => 'alice.mercer@bluesky.example',
            'phone'                => '+1-555-0301',
            'source'               => 'website',
            'expected_revenue'     => 24000.00,
            'probability'          => 25,
            'expected_close_date'  => '2026-09-30',
            'priority'             => 'high',
            'status'               => 'open',
            'description'          => 'Prospective client interested in the full ERP suite for a 50-person team.',
        ]);

        // Opportunity — won
        CrmLead::create([
            'tenant_id'            => $tenant->id,
            'title'                => 'Annual Support Contract Renewal',
            'type'                 => 'opportunity',
            'contact_name'         => 'David Okafor',
            'company_name'         => 'Pinnacle Logistics',
            'email'                => 'david.okafor@pinnacle.example',
            'phone'                => '+1-555-0402',
            'source'               => 'referral',
            'expected_revenue'     => 8500.00,
            'probability'          => 100,
            'expected_close_date'  => '2026-06-30',
            'priority'             => 'normal',
            'status'               => 'won',
            'won_at'               => now()->subDays(5),
        ]);

        // Lead — lost
        CrmLead::create([
            'tenant_id'            => $tenant->id,
            'title'                => 'Payroll Module Standalone License',
            'type'                 => 'lead',
            'contact_name'         => 'Rachel Kim',
            'company_name'         => 'Sunrise Retail Group',
            'email'                => 'rachel.kim@sunrise.example',
            'source'               => 'trade_show',
            'expected_revenue'     => 3200.00,
            'probability'          => 0,
            'priority'             => 'low',
            'status'               => 'lost',
            'lost_reason'          => 'Prospect chose a competitor with a lower price point.',
            'lost_at'              => now()->subWeeks(2),
        ]);
    }
}

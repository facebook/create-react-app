<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionsSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Subscription plans
        $starter = SubscriptionPlan::create([
            'tenant_id'     => $tenant->id,
            'name'          => 'Starter',
            'description'   => 'Perfect for small teams — core ERP modules with up to 5 users.',
            'billing_cycle' => 'monthly',
            'price'         => 49.00,
            'trial_days'    => 14,
            'is_active'     => true,
        ]);

        $professional = SubscriptionPlan::create([
            'tenant_id'     => $tenant->id,
            'name'          => 'Professional',
            'description'   => 'Full-featured ERP suite for growing businesses — unlimited users, priority support.',
            'billing_cycle' => 'annual',
            'price'         => 499.00,
            'trial_days'    => 30,
            'is_active'     => true,
        ]);

        // Subscriptions
        Subscription::create([
            'tenant_id'            => $tenant->id,
            'plan_id'              => $starter->id,
            'customer_name'        => 'Bright Horizons Ltd',
            'customer_email'       => 'billing@brighthorizons.example',
            'status'               => 'active',
            'current_period_start' => '2026-06-01',
            'current_period_end'   => '2026-06-30',
        ]);

        Subscription::create([
            'tenant_id'            => $tenant->id,
            'plan_id'              => $professional->id,
            'customer_name'        => 'Nexus Manufacturing Inc',
            'customer_email'       => 'accounts@nexusmfg.example',
            'status'               => 'trial',
            'trial_ends_at'        => '2026-07-19 23:59:59',
            'current_period_start' => '2026-06-19',
            'current_period_end'   => '2027-06-18',
            'notes'                => 'Migrating from legacy ERP — trial extended by request.',
        ]);
    }
}

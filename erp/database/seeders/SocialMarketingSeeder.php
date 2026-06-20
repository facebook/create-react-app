<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\SocialMarketing\Models\SocialAccount;
use App\Modules\SocialMarketing\Models\SocialPost;
use Illuminate\Database\Seeder;

class SocialMarketingSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Social accounts
        $linkedin = SocialAccount::create([
            'tenant_id'       => $tenant->id,
            'platform'        => 'linkedin',
            'account_name'    => 'Acme ERP Solutions',
            'account_handle'  => 'acme-erp-solutions',
            'is_connected'    => true,
            'is_active'       => true,
            'followers_count' => 3420,
            'following_count' => 180,
            'last_synced_at'  => '2026-06-19 08:00:00',
        ]);

        $instagram = SocialAccount::create([
            'tenant_id'       => $tenant->id,
            'platform'        => 'instagram',
            'account_name'    => 'Acme ERP',
            'account_handle'  => '@acmeerp',
            'is_connected'    => true,
            'is_active'       => true,
            'followers_count' => 1850,
            'following_count' => 310,
            'last_synced_at'  => '2026-06-19 08:00:00',
        ]);

        // Social posts
        SocialPost::create([
            'tenant_id'          => $tenant->id,
            'content'            => "Excited to announce our new Repairs module — track every repair order from diagnosis to delivery, all in one place. #ERP #RepairManagement",
            'platforms'          => ['linkedin'],
            'social_account_ids' => [$linkedin->id],
            'status'             => 'published',
            'published_at'       => '2026-06-10 10:00:00',
            'metrics'            => ['likes' => 94, 'shares' => 22, 'comments' => 11, 'reach' => 1800],
        ]);

        SocialPost::create([
            'tenant_id'          => $tenant->id,
            'content'            => "Did you know our Subscriptions module lets you manage billing cycles, trial periods, and renewals automatically? DM us for a demo! 🚀 #SaaS #Subscriptions",
            'platforms'          => ['instagram'],
            'social_account_ids' => [$instagram->id],
            'status'             => 'published',
            'published_at'       => '2026-06-14 14:30:00',
            'metrics'            => ['likes' => 210, 'shares' => 35, 'comments' => 18, 'reach' => 3200],
        ]);

        SocialPost::create([
            'tenant_id'          => $tenant->id,
            'content'            => "Summer update dropping soon — new Survey builder, Website CMS, and Sign module all in one release. Stay tuned! #ProductUpdate",
            'platforms'          => ['linkedin', 'instagram'],
            'social_account_ids' => [$linkedin->id, $instagram->id],
            'status'             => 'scheduled',
            'scheduled_at'       => '2026-07-01 09:00:00',
        ]);
    }
}

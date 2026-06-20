<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Marketing\Models\EmailCampaign;
use App\Modules\Marketing\Models\MailingList;
use App\Modules\Marketing\Models\Subscriber;
use Illuminate\Database\Seeder;

class MarketingSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Campaigns
        EmailCampaign::create([
            'tenant_id' => $tenant->id,
            'name'      => 'Summer Sale 2026',
            'subject'   => 'Exclusive Summer Deals Just for You!',
            'body_html' => '<h1>Summer Sale</h1><p>Up to 40% off on selected items. Shop now and save big this summer.</p>',
            'from_name'  => 'Acme Store',
            'from_email' => 'noreply@acme.example',
            'status'    => 'sent',
        ]);

        EmailCampaign::create([
            'tenant_id'    => $tenant->id,
            'name'         => 'Product Launch — Widget Pro',
            'subject'      => 'Introducing Widget Pro — Available Now',
            'preview_text' => 'The most powerful widget yet is here.',
            'body_html'    => '<h1>Widget Pro is Live</h1><p>Discover our brand-new Widget Pro with advanced features and sleek design.</p>',
            'from_name'    => 'Acme Product Team',
            'from_email'   => 'products@acme.example',
            'status'       => 'draft',
        ]);

        // Mailing list
        $list = MailingList::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'General Newsletter',
            'description' => 'All subscribers who opted in to receive company updates.',
            'is_active'   => true,
        ]);

        // Subscribers
        $subscribers = [
            ['email' => 'alice@example.com',  'name' => 'Alice Johnson'],
            ['email' => 'bob@example.com',    'name' => 'Bob Martinez'],
            ['email' => 'carol@example.com',  'name' => 'Carol Smith'],
        ];

        foreach ($subscribers as $data) {
            $subscriber = Subscriber::create([
                'tenant_id'     => $tenant->id,
                'email'         => $data['email'],
                'name'          => $data['name'],
                'status'        => 'subscribed',
                'subscribed_at' => now(),
                'source'        => 'website',
            ]);

            $list->subscribers()->attach($subscriber->id);
        }
    }
}

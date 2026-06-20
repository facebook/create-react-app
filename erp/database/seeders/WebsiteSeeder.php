<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Website\Models\BlogPost;
use App\Modules\Website\Models\WebPage;
use Illuminate\Database\Seeder;

class WebsiteSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Web pages
        WebPage::create([
            'tenant_id'        => $tenant->id,
            'title'            => 'Home',
            'slug'             => 'home',
            'content'          => '<h1>Welcome to Acme ERP</h1><p>The all-in-one business management platform built for growing companies.</p>',
            'meta_title'       => 'Acme ERP — Business Management Software',
            'meta_description' => 'Manage inventory, finance, HR, projects, and more from a single platform.',
            'status'           => 'published',
            'published_at'     => '2026-01-01 00:00:00',
            'is_homepage'      => true,
            'layout'           => 'default',
        ]);

        WebPage::create([
            'tenant_id'        => $tenant->id,
            'title'            => 'Features',
            'slug'             => 'features',
            'content'          => '<h2>Everything your business needs</h2><p>From finance and inventory to HR, repairs, and subscriptions — Acme ERP covers every department.</p>',
            'meta_title'       => 'Features — Acme ERP',
            'meta_description' => 'Explore the full feature set of Acme ERP: finance, inventory, CRM, HR, projects, repairs, subscriptions, and more.',
            'status'           => 'published',
            'published_at'     => '2026-01-15 00:00:00',
            'is_homepage'      => false,
            'layout'           => 'default',
        ]);

        WebPage::create([
            'tenant_id'        => $tenant->id,
            'title'            => 'Contact Us',
            'slug'             => 'contact',
            'content'          => '<h2>Get in touch</h2><p>Our team is available Monday–Friday, 9 am–6 pm. Fill in the form and we will get back to you within 24 hours.</p>',
            'meta_title'       => 'Contact — Acme ERP',
            'meta_description' => 'Contact the Acme ERP support team for demos, pricing, or general enquiries.',
            'status'           => 'draft',
            'is_homepage'      => false,
            'layout'           => 'default',
        ]);

        // Blog posts
        BlogPost::create([
            'tenant_id'    => $tenant->id,
            'title'        => '5 Ways an ERP System Saves Your Finance Team Hours Every Week',
            'slug'         => '5-ways-erp-saves-finance-team-hours',
            'excerpt'      => 'Discover how automating accounts payable, bank reconciliation, and financial reporting frees your finance team to focus on what matters.',
            'content'      => '<p>Finance teams in growing businesses often spend an enormous amount of time on manual data entry, chasing approvals, and reconciling accounts. An integrated ERP system eliminates these bottlenecks.</p><p>Here are five concrete ways the right ERP saves your team hours every single week...</p>',
            'status'       => 'published',
            'published_at' => '2026-05-20 09:00:00',
            'tags'         => ['finance', 'productivity', 'automation', 'erp'],
            'view_count'   => 348,
        ]);

        BlogPost::create([
            'tenant_id'    => $tenant->id,
            'title'        => 'How to Manage Subcontracting Without Losing Visibility',
            'slug'         => 'manage-subcontracting-without-losing-visibility',
            'excerpt'      => 'Subcontracting adds complexity to your supply chain. Learn how a dedicated subcontracting module keeps you in control from order to receipt.',
            'content'      => '<p>When you outsource part of your production to a third-party manufacturer, it can feel like you are flying blind. Components go out and finished goods come back — but what happens in between?</p><p>A subcontracting module built into your ERP changes that completely...</p>',
            'status'       => 'published',
            'published_at' => '2026-06-05 10:00:00',
            'tags'         => ['subcontracting', 'supply-chain', 'manufacturing', 'erp'],
            'view_count'   => 175,
        ]);
    }
}

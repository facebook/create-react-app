<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\KnowledgeBase\Models\KbArticle;
use App\Modules\KnowledgeBase\Models\KbCategory;
use Illuminate\Database\Seeder;

class KnowledgeBaseSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $userId = \App\Models\User::first()->id ?? 1;

        $gettingStarted = KbCategory::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Getting Started',
            'slug'        => 'getting-started',
            'description' => 'Introductory guides for new users.',
            'sequence'    => 1,
        ]);

        $billing = KbCategory::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Billing & Invoicing',
            'slug'        => 'billing-invoicing',
            'description' => 'Everything related to invoices, payments, and billing settings.',
            'sequence'    => 2,
        ]);

        KbArticle::create([
            'tenant_id'    => $tenant->id,
            'category_id'  => $gettingStarted->id,
            'title'        => 'How to Set Up Your Account',
            'slug'         => 'how-to-set-up-your-account',
            'content'      => "## Welcome!\n\nFollow these steps to get started:\n\n1. Complete your company profile.\n2. Invite team members via the Users section.\n3. Configure your fiscal year in Settings.\n4. Import or create your chart of accounts.\n\nFor further assistance, contact our support team.",
            'excerpt'      => 'A step-by-step guide to completing your initial account setup.',
            'status'       => 'published',
            'author_id'    => $userId,
            'published_at' => now()->subDays(30),
            'tags'         => ['setup', 'onboarding', 'account'],
        ]);

        KbArticle::create([
            'tenant_id'    => $tenant->id,
            'category_id'  => $gettingStarted->id,
            'title'        => 'Understanding User Roles and Permissions',
            'slug'         => 'understanding-user-roles-and-permissions',
            'content'      => "## Roles Overview\n\nThe system supports the following built-in roles:\n\n- **Admin** – Full access to all modules and settings.\n- **Manager** – Can approve transactions and view reports.\n- **Staff** – Day-to-day data entry and task management.\n- **Viewer** – Read-only access to assigned modules.\n\nCustom roles can be created under Settings → Roles.",
            'excerpt'      => 'Learn about the different user roles and what each one can access.',
            'status'       => 'published',
            'author_id'    => $userId,
            'published_at' => now()->subDays(25),
            'tags'         => ['roles', 'permissions', 'users'],
        ]);

        KbArticle::create([
            'tenant_id'    => $tenant->id,
            'category_id'  => $billing->id,
            'title'        => 'How to Create and Send an Invoice',
            'slug'         => 'how-to-create-and-send-an-invoice',
            'content'      => "## Creating an Invoice\n\n1. Navigate to **Finance → Invoices** and click **New Invoice**.\n2. Select the customer from the dropdown or enter details manually.\n3. Add line items with descriptions, quantities, and unit prices.\n4. Apply any applicable taxes or discounts.\n5. Click **Save & Send** to email the invoice directly to the customer.\n\n> Tip: Use recurring invoices for subscription-based billing.",
            'excerpt'      => 'Step-by-step instructions for creating, customising, and sending invoices to customers.',
            'status'       => 'published',
            'author_id'    => $userId,
            'published_at' => now()->subDays(20),
            'tags'         => ['invoice', 'billing', 'finance'],
        ]);
    }
}

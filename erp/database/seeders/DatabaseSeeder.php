<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $tenant = Tenant::create([
            'name'      => 'Demo Company',
            'slug'      => 'demo',
            'domain'    => null,
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'name'      => 'Admin User',
            'email'     => 'admin@example.com',
            'tenant_id' => $tenant->id,
        ]);

        $admin->assignRole('super-admin');

        $this->call(InventorySeeder::class);
        $this->call(FinanceSeeder::class);
        $this->call(HRSeeder::class);
        $this->call(AccountingSeeder::class);
        $this->call(PurchaseSeeder::class);
        $this->call(CrmSeeder::class);
        $this->call(ManufacturingSeeder::class);
        $this->call(PmSeeder::class);
        $this->call(MaintenanceSeeder::class);
        $this->call(FleetSeeder::class);
        $this->call(RentalSeeder::class);
        $this->call(RepairsSeeder::class);
        $this->call(QualityControlSeeder::class);
        $this->call(SubcontractingSeeder::class);
        $this->call(MarketingSeeder::class);
        $this->call(EcommerceSeeder::class);
        $this->call(SubscriptionsSeeder::class);
        $this->call(AppointmentsSeeder::class);
        $this->call(ApprovalsSeeder::class);
        $this->call(DiscussSeeder::class);
        $this->call(DocumentsSeeder::class);
        $this->call(EventsSeeder::class);
        $this->call(FieldServiceSeeder::class);
        $this->call(FrontdeskSeeder::class);
        $this->call(HelpdeskSeeder::class);
        $this->call(KnowledgeBaseSeeder::class);
        $this->call(LiveChatSeeder::class);
        $this->call(LunchSeeder::class);
        $this->call(PlanningSeeder::class);
        $this->call(PosSeeder::class);
        $this->call(SignSeeder::class);
        $this->call(SocialMarketingSeeder::class);
        $this->call(SurveySeeder::class);
        $this->call(WebsiteSeeder::class);
    }
}

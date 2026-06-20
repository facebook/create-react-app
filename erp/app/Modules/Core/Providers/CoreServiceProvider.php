<?php

namespace App\Modules\Core\Providers;

use App\Modules\Core\Models\AuditLog;
use App\Modules\Core\Models\Company;
use App\Modules\Core\Policies\AuditLogPolicy;
use App\Modules\Core\Policies\CompanyPolicy;
use App\Modules\Finance\Providers\FinanceServiceProvider;
use App\Modules\HR\Providers\HRServiceProvider;
use App\Modules\Inventory\Providers\InventoryServiceProvider;
use App\Modules\Manufacturing\Providers\ManufacturingServiceProvider;
use App\Modules\CRM\Providers\CRMServiceProvider;
use App\Modules\PM\Providers\PMServiceProvider;
use App\Modules\POS\Providers\POSServiceProvider;
use App\Modules\Helpdesk\Providers\HelpdeskServiceProvider;
use App\Modules\Accounting\Providers\AccountingServiceProvider;
use App\Modules\Fleet\Providers\FleetServiceProvider;
use App\Modules\Marketing\Providers\MarketingServiceProvider;
use App\Modules\FieldService\Providers\FieldServiceProvider;
use App\Modules\Approvals\Providers\ApprovalsServiceProvider;
use App\Modules\Ecommerce\Providers\EcommerceServiceProvider;
use App\Modules\Discuss\Providers\DiscussServiceProvider;
use App\Modules\Subcontracting\Providers\SubcontractingServiceProvider;
use App\Modules\Rental\Providers\RentalServiceProvider;
use App\Modules\Subscriptions\Providers\SubscriptionsServiceProvider;
use App\Modules\Survey\Providers\SurveyServiceProvider;
use App\Modules\Documents\Providers\DocumentsServiceProvider;
use App\Modules\Events\Providers\EventsServiceProvider;
use App\Modules\KnowledgeBase\Providers\KnowledgeBaseServiceProvider;
use App\Modules\Planning\Providers\PlanningServiceProvider;
use App\Modules\Sign\Providers\SignServiceProvider;
use App\Modules\Maintenance\Providers\MaintenanceServiceProvider;
use App\Modules\QualityControl\Providers\QualityControlServiceProvider;
use App\Modules\LiveChat\Providers\LiveChatServiceProvider;
use App\Modules\Repairs\Providers\RepairsServiceProvider;
use App\Modules\SocialMarketing\Providers\SocialMarketingServiceProvider;
use App\Modules\Frontdesk\Providers\FrontdeskServiceProvider;
use App\Modules\Website\Providers\WebsiteServiceProvider;
use App\Modules\Appointments\Providers\AppointmentsServiceProvider;
use App\Modules\Lunch\Providers\LunchServiceProvider;
use App\Modules\Purchase\Providers\PurchaseServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class CoreServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(InventoryServiceProvider::class);
        $this->app->register(FinanceServiceProvider::class);
        $this->app->register(HRServiceProvider::class);
        $this->app->register(ManufacturingServiceProvider::class);
        $this->app->register(CRMServiceProvider::class);
        $this->app->register(PMServiceProvider::class);
        $this->app->register(POSServiceProvider::class);
        $this->app->register(HelpdeskServiceProvider::class);
        $this->app->register(AccountingServiceProvider::class);
        $this->app->register(FleetServiceProvider::class);
        $this->app->register(MarketingServiceProvider::class);
        $this->app->register(FieldServiceProvider::class);
        $this->app->register(ApprovalsServiceProvider::class);
        $this->app->register(EcommerceServiceProvider::class);
        $this->app->register(DiscussServiceProvider::class);
        $this->app->register(SubcontractingServiceProvider::class);
        $this->app->register(RentalServiceProvider::class);
        $this->app->register(SubscriptionsServiceProvider::class);
        $this->app->register(SurveyServiceProvider::class);
        $this->app->register(DocumentsServiceProvider::class);
        $this->app->register(EventsServiceProvider::class);
        $this->app->register(KnowledgeBaseServiceProvider::class);
        $this->app->register(PlanningServiceProvider::class);
        $this->app->register(SignServiceProvider::class);
        $this->app->register(MaintenanceServiceProvider::class);
        $this->app->register(QualityControlServiceProvider::class);
        $this->app->register(LiveChatServiceProvider::class);
        $this->app->register(RepairsServiceProvider::class);
        $this->app->register(SocialMarketingServiceProvider::class);
        $this->app->register(FrontdeskServiceProvider::class);
        $this->app->register(LunchServiceProvider::class);
        $this->app->register(WebsiteServiceProvider::class);
        $this->app->register(AppointmentsServiceProvider::class);
        $this->app->register(PurchaseServiceProvider::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/core.php');
        Gate::policy(AuditLog::class, AuditLogPolicy::class);
        Gate::policy(Company::class, CompanyPolicy::class);
    }
}

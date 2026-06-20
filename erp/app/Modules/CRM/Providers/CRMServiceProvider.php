<?php

namespace App\Modules\CRM\Providers;

use App\Modules\CRM\Models\CrmActivity;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\CrmStage;
use App\Modules\CRM\Policies\CrmPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class CRMServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/crm.php');
        Gate::policy(CrmStage::class,    CrmPolicy::class);
        Gate::policy(CrmLead::class,     CrmPolicy::class);
        Gate::policy(CrmActivity::class, CrmPolicy::class);
    }
}

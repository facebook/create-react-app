<?php

namespace App\Modules\FieldService\Providers;

use App\Modules\FieldService\Models\ServiceChecklist;
use App\Modules\FieldService\Models\ServiceChecklistItem;
use App\Modules\FieldService\Models\ServiceOrder;
use App\Modules\FieldService\Models\ServiceOrderChecklistResult;
use App\Modules\FieldService\Models\ServiceOrderItem;
use App\Modules\FieldService\Policies\FieldServicePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class FieldServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/field_service.php');
        Gate::policy(ServiceOrder::class,               FieldServicePolicy::class);
        Gate::policy(ServiceOrderItem::class,           FieldServicePolicy::class);
        Gate::policy(ServiceChecklist::class,           FieldServicePolicy::class);
        Gate::policy(ServiceChecklistItem::class,       FieldServicePolicy::class);
        Gate::policy(ServiceOrderChecklistResult::class, FieldServicePolicy::class);
    }
}

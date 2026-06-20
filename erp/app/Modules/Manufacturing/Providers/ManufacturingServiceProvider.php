<?php

namespace App\Modules\Manufacturing\Providers;

use App\Modules\Manufacturing\Models\BillOfMaterials;
use App\Modules\Manufacturing\Models\BomLine;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\Manufacturing\Models\MoComponent;
use App\Modules\Manufacturing\Models\WorkCenter;
use App\Modules\Manufacturing\Models\WorkOrder;
use App\Modules\Manufacturing\Policies\BomPolicy;
use App\Modules\Manufacturing\Policies\ManufacturingOrderPolicy;
use App\Modules\Manufacturing\Policies\WorkCenterPolicy;
use App\Modules\Manufacturing\Policies\WorkOrderPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class ManufacturingServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/manufacturing.php');

        Gate::policy(BillOfMaterials::class, BomPolicy::class);
        Gate::policy(BomLine::class,         BomPolicy::class);
        Gate::policy(WorkCenter::class,          WorkCenterPolicy::class);
        Gate::policy(ManufacturingOrder::class,  ManufacturingOrderPolicy::class);
        Gate::policy(MoComponent::class,         ManufacturingOrderPolicy::class);
        Gate::policy(WorkOrder::class,           WorkOrderPolicy::class);
    }
}

<?php

namespace App\Modules\Ecommerce\Providers;

use App\Modules\Ecommerce\Models\StoreCategory;
use App\Modules\Ecommerce\Models\StoreOrder;
use App\Modules\Ecommerce\Models\StoreOrderItem;
use App\Modules\Ecommerce\Models\StoreProduct;
use App\Modules\Ecommerce\Models\StoreSettings;
use App\Modules\Ecommerce\Policies\EcommercePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class EcommerceServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/ecommerce.php');

        Gate::policy(StoreSettings::class,   EcommercePolicy::class);
        Gate::policy(StoreCategory::class,   EcommercePolicy::class);
        Gate::policy(StoreProduct::class,    EcommercePolicy::class);
        Gate::policy(StoreOrder::class,      EcommercePolicy::class);
        Gate::policy(StoreOrderItem::class,  EcommercePolicy::class);
    }
}

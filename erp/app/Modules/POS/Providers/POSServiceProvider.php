<?php

namespace App\Modules\POS\Providers;

use App\Modules\POS\Models\PosOrder;
use App\Modules\POS\Models\PosOrderItem;
use App\Modules\POS\Models\PosPayment;
use App\Modules\POS\Models\PosSession;
use App\Modules\POS\Policies\PosPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class POSServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/pos.php');

        Gate::policy(PosSession::class,   PosPolicy::class);
        Gate::policy(PosOrder::class,     PosPolicy::class);
        Gate::policy(PosOrderItem::class, PosPolicy::class);
        Gate::policy(PosPayment::class,   PosPolicy::class);
    }
}

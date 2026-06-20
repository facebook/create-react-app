<?php

namespace App\Modules\Helpdesk\Providers;

use App\Modules\Helpdesk\Models\HelpdeskSlaPolicy;
use App\Modules\Helpdesk\Models\HelpdeskTeam;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use App\Modules\Helpdesk\Policies\HelpdeskPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class HelpdeskServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/helpdesk.php');
        Gate::policy(HelpdeskTicket::class,    HelpdeskPolicy::class);
        Gate::policy(HelpdeskTeam::class,      HelpdeskPolicy::class);
        Gate::policy(HelpdeskSlaPolicy::class, HelpdeskPolicy::class);
    }
}

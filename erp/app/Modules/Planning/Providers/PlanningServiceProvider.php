<?php

namespace App\Modules\Planning\Providers;

use Illuminate\Support\ServiceProvider;

class PlanningServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/planning.php');
        $this->loadMigrationsFrom(__DIR__ . '/../../../database/migrations');
    }
}

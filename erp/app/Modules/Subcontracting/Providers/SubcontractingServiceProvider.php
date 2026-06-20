<?php

namespace App\Modules\Subcontracting\Providers;

use Illuminate\Support\ServiceProvider;

class SubcontractingServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/subcontracting.php');
        $this->loadMigrationsFrom(__DIR__ . '/../../../database/migrations');
    }
}

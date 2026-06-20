<?php

namespace App\Modules\Repairs\Providers;

use Illuminate\Support\ServiceProvider;

class RepairsServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/repairs.php');
    }
}

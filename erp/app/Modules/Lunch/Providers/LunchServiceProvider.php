<?php

namespace App\Modules\Lunch\Providers;

use Illuminate\Support\ServiceProvider;

class LunchServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/lunch.php');
    }
}

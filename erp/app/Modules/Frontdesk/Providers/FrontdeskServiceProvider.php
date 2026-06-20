<?php

namespace App\Modules\Frontdesk\Providers;

use Illuminate\Support\ServiceProvider;

class FrontdeskServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/frontdesk.php');
    }
}

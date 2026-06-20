<?php

namespace App\Modules\Events\Providers;

use Illuminate\Support\ServiceProvider;

class EventsServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/events.php');
        $this->loadMigrationsFrom(__DIR__ . '/../../../database/migrations');
    }
}

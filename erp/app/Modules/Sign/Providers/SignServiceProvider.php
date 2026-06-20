<?php

namespace App\Modules\Sign\Providers;

use Illuminate\Support\ServiceProvider;

class SignServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/sign.php');
        $this->loadMigrationsFrom(__DIR__ . '/../../../database/migrations');
    }
}

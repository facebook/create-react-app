<?php

namespace App\Modules\QualityControl\Providers;

use Illuminate\Support\ServiceProvider;

class QualityControlServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/quality.php');
    }
}

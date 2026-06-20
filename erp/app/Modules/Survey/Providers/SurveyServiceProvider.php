<?php

namespace App\Modules\Survey\Providers;

use Illuminate\Support\ServiceProvider;

class SurveyServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/survey.php');
        $this->loadMigrationsFrom(__DIR__ . '/../../../database/migrations');
    }
}

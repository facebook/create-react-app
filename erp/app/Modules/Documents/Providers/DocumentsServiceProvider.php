<?php

namespace App\Modules\Documents\Providers;

use Illuminate\Support\ServiceProvider;

class DocumentsServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/documents.php');
        $this->loadMigrationsFrom(__DIR__ . '/../../../database/migrations');
    }
}

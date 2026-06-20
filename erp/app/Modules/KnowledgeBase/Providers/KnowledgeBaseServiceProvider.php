<?php

namespace App\Modules\KnowledgeBase\Providers;

use Illuminate\Support\ServiceProvider;

class KnowledgeBaseServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/knowledge_base.php');
        $this->loadMigrationsFrom(__DIR__ . '/../../../database/migrations');
    }
}

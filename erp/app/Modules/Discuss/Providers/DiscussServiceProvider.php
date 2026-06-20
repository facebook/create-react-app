<?php

namespace App\Modules\Discuss\Providers;

use Illuminate\Support\ServiceProvider;

class DiscussServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/discuss.php');
    }
}

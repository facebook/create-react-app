<?php

namespace App\Modules\SocialMarketing\Providers;

use Illuminate\Support\ServiceProvider;

class SocialMarketingServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/social_marketing.php');
    }
}

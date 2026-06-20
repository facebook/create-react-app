<?php

namespace App\Modules\Marketing\Providers;

use App\Modules\Marketing\Models\CampaignSend;
use App\Modules\Marketing\Models\EmailCampaign;
use App\Modules\Marketing\Models\MailingList;
use App\Modules\Marketing\Models\Subscriber;
use App\Modules\Marketing\Policies\MarketingPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class MarketingServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/marketing.php');
        Gate::policy(MailingList::class,   MarketingPolicy::class);
        Gate::policy(Subscriber::class,    MarketingPolicy::class);
        Gate::policy(EmailCampaign::class, MarketingPolicy::class);
        Gate::policy(CampaignSend::class,  MarketingPolicy::class);
    }
}

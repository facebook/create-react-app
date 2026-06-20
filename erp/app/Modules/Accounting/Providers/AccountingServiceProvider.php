<?php

namespace App\Modules\Accounting\Providers;

use App\Modules\Accounting\Models\Account;
use App\Modules\Accounting\Models\AccountBalance;
use App\Modules\Accounting\Models\AccountingPeriod;
use App\Modules\Accounting\Models\JournalEntry;
use App\Modules\Accounting\Policies\AccountingPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AccountingServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/accounting.php');

        Gate::policy(Account::class,          AccountingPolicy::class);
        Gate::policy(AccountingPeriod::class, AccountingPolicy::class);
        Gate::policy(JournalEntry::class,     AccountingPolicy::class);
        Gate::policy(AccountBalance::class,   AccountingPolicy::class);
    }
}

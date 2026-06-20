<?php

namespace App\Modules\Approvals\Providers;

use App\Modules\Approvals\Models\ApprovalWorkflow;
use App\Modules\Approvals\Models\ApprovalRequest;
use App\Modules\Approvals\Policies\ApprovalsPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class ApprovalsServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/approvals.php');

        Gate::policy(ApprovalWorkflow::class, ApprovalsPolicy::class);
        Gate::policy(ApprovalRequest::class, ApprovalsPolicy::class);
    }
}

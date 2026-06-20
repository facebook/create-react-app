<?php

namespace App\Modules\PM\Providers;

use App\Modules\PM\Models\Milestone;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use App\Modules\PM\Models\TimeEntry;
use App\Modules\PM\Policies\ProjectPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class PMServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/pm.php');

        Gate::policy(Project::class,   ProjectPolicy::class);
        Gate::policy(Task::class,      ProjectPolicy::class);
        Gate::policy(Milestone::class, ProjectPolicy::class);
        Gate::policy(TimeEntry::class, ProjectPolicy::class);
    }
}

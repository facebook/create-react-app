<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\CompetencyFramework;

class CompetencyFrameworkPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, CompetencyFramework $competencyFramework): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, CompetencyFramework $competencyFramework): bool
    {
        return $user->can('hr.create');
    }

    public function activate(User $user, CompetencyFramework $competencyFramework): bool
    {
        return $user->can('hr.create');
    }

    public function archive(User $user, CompetencyFramework $competencyFramework): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user, CompetencyFramework $competencyFramework): bool
    {
        return $user->can('hr.delete');
    }
}

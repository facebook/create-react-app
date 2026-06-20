<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\SuccessionPlan;

class SuccessionPlanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, SuccessionPlan $successionPlan): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, SuccessionPlan $successionPlan): bool
    {
        return $user->can('hr.create');
    }

    public function complete(User $user, SuccessionPlan $successionPlan): bool
    {
        return $user->can('hr.create');
    }

    public function deactivate(User $user, SuccessionPlan $successionPlan): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user, SuccessionPlan $successionPlan): bool
    {
        return $user->can('hr.delete');
    }
}

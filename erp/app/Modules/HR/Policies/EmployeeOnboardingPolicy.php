<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\EmployeeOnboarding;

class EmployeeOnboardingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, EmployeeOnboarding $onboarding): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, EmployeeOnboarding $onboarding): bool
    {
        return $user->can('hr.update');
    }

    public function delete(User $user, EmployeeOnboarding $onboarding): bool
    {
        return $user->can('hr.delete');
    }
}

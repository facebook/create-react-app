<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\EmployeeGoal;

class EmployeeGoalPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, EmployeeGoal $employeeGoal): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, EmployeeGoal $employeeGoal): bool
    {
        return $user->can('hr.create');
    }

    public function complete(User $user, EmployeeGoal $employeeGoal): bool
    {
        return $user->can('hr.create');
    }

    public function miss(User $user, EmployeeGoal $employeeGoal): bool
    {
        return $user->can('hr.create');
    }

    public function cancel(User $user, EmployeeGoal $employeeGoal): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user, EmployeeGoal $employeeGoal): bool
    {
        return $user->can('hr.delete');
    }
}

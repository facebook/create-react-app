<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\EmployeeSurvey;

class EmployeeSurveyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('hr.view');
    }

    public function view(User $user, EmployeeSurvey $survey): bool
    {
        return $user->hasPermissionTo('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('hr.create');
    }

    public function update(User $user, EmployeeSurvey $survey): bool
    {
        return $user->hasPermissionTo('hr.create');
    }

    public function delete(User $user, EmployeeSurvey $survey): bool
    {
        return $user->hasPermissionTo('hr.delete');
    }
}

<?php

namespace App\Modules\HR\Policies;

use App\Models\User;

class EmployeeSkillPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('hr.view');
    }

    public function view(User $user, $model): bool
    {
        return $user->hasPermissionTo('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('hr.create');
    }

    public function update(User $user, $model): bool
    {
        return $user->hasPermissionTo('hr.create');
    }

    public function delete(User $user, $model): bool
    {
        return $user->hasPermissionTo('hr.delete');
    }
}

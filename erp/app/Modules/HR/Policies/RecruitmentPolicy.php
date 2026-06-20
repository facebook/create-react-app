<?php

namespace App\Modules\HR\Policies;

use App\Models\User;

class RecruitmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user): bool
    {
        return $user->can('hr.delete');
    }
}

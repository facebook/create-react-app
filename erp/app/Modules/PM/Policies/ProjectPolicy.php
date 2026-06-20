<?php

namespace App\Modules\PM\Policies;

use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user): bool
    {
        return true;
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

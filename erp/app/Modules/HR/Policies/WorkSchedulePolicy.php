<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class WorkSchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, Model $model): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, Model $model): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user, Model $model): bool
    {
        return $user->can('hr.delete');
    }
}

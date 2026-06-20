<?php

namespace App\Modules\Manufacturing\Policies;

use App\Models\User;
use App\Modules\Manufacturing\Models\WorkCenter;

class WorkCenterPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, WorkCenter $workCenter): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, WorkCenter $workCenter): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, WorkCenter $workCenter): bool
    {
        return $user->can('inventory.delete');
    }
}

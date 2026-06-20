<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class QcPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, Model $model): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, Model $model): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, Model $model): bool
    {
        return $user->can('inventory.delete');
    }
}

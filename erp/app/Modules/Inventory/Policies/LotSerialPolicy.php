<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;

class LotSerialPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('inventory.view');
    }

    public function view(User $user, $model): bool
    {
        return $user->hasPermissionTo('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('inventory.create');
    }

    public function update(User $user, $model): bool
    {
        return $user->hasPermissionTo('inventory.create');
    }

    public function delete(User $user, $model): bool
    {
        return $user->hasPermissionTo('inventory.delete');
    }
}

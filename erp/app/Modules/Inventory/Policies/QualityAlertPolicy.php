<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;

class QualityAlertPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function investigate(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function resolve(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function close(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user): bool
    {
        return $user->can('inventory.delete');
    }
}

<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\ReorderRule;

class ReorderRulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('inventory.view');
    }

    public function view(User $user, ReorderRule $r): bool
    {
        return $user->hasPermissionTo('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('inventory.create');
    }

    public function update(User $user, ReorderRule $r): bool
    {
        return $user->hasPermissionTo('inventory.create');
    }

    public function delete(User $user, ReorderRule $r): bool
    {
        return $user->hasPermissionTo('inventory.delete');
    }

    public function trigger(User $user, ReorderRule $r): bool
    {
        return $user->hasPermissionTo('inventory.create');
    }

    public function pause(User $user, ReorderRule $r): bool
    {
        return $user->hasPermissionTo('inventory.create');
    }

    public function resume(User $user, ReorderRule $r): bool
    {
        return $user->hasPermissionTo('inventory.create');
    }
}

<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\StockPicking;

class StockPickingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, StockPicking $stockPicking): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, StockPicking $stockPicking): bool
    {
        return $user->can('inventory.create');
    }

    public function confirm(User $user, StockPicking $stockPicking): bool
    {
        return $user->can('inventory.create');
    }

    public function validate(User $user, StockPicking $stockPicking): bool
    {
        return $user->can('inventory.create');
    }

    public function cancel(User $user, StockPicking $stockPicking): bool
    {
        return $user->can('inventory.delete');
    }

    public function delete(User $user, StockPicking $stockPicking): bool
    {
        return $user->can('inventory.delete');
    }
}

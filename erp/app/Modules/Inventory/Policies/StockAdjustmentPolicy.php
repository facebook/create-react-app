<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\StockAdjustment;

class StockAdjustmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, StockAdjustment $adj): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, StockAdjustment $adj): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, StockAdjustment $adj): bool
    {
        return $user->can('inventory.delete');
    }
}

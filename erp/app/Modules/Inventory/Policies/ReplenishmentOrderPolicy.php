<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\ReplenishmentOrder;

class ReplenishmentOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, ReplenishmentOrder $replenishmentOrder): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, ReplenishmentOrder $replenishmentOrder): bool
    {
        return $user->can('inventory.create');
    }

    public function confirm(User $user, ReplenishmentOrder $replenishmentOrder): bool
    {
        return $user->can('inventory.create');
    }

    public function markInProgress(User $user, ReplenishmentOrder $replenishmentOrder): bool
    {
        return $user->can('inventory.create');
    }

    public function complete(User $user, ReplenishmentOrder $replenishmentOrder): bool
    {
        return $user->can('inventory.create');
    }

    public function cancel(User $user, ReplenishmentOrder $replenishmentOrder): bool
    {
        return $user->can('inventory.delete');
    }

    public function delete(User $user, ReplenishmentOrder $replenishmentOrder): bool
    {
        return $user->can('inventory.delete');
    }
}

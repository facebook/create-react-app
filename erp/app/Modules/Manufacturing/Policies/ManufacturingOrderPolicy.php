<?php

namespace App\Modules\Manufacturing\Policies;

use App\Models\User;
use App\Modules\Manufacturing\Models\ManufacturingOrder;

class ManufacturingOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ManufacturingOrder $mo): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, ManufacturingOrder $mo): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, ManufacturingOrder $mo): bool
    {
        return $user->can('inventory.delete');
    }

    public function confirm(User $user, ManufacturingOrder $mo): bool
    {
        return $user->can('inventory.create');
    }

    public function startProduction(User $user, ManufacturingOrder $mo): bool
    {
        return $user->can('inventory.create');
    }

    public function complete(User $user, ManufacturingOrder $mo): bool
    {
        return $user->can('inventory.create');
    }

    public function cancel(User $user, ManufacturingOrder $mo): bool
    {
        return $user->can('inventory.create');
    }
}

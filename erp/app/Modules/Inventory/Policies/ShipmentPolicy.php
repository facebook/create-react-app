<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\Shipment;

class ShipmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, Shipment $shipment): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, Shipment $shipment): bool
    {
        return $user->can('inventory.create');
    }

    public function dispatch(User $user, Shipment $shipment): bool
    {
        return $user->can('inventory.create');
    }

    public function deliver(User $user, Shipment $shipment): bool
    {
        return $user->can('inventory.create');
    }

    public function cancel(User $user, Shipment $shipment): bool
    {
        return $user->can('inventory.delete');
    }

    public function delete(User $user, Shipment $shipment): bool
    {
        return $user->can('inventory.delete');
    }
}

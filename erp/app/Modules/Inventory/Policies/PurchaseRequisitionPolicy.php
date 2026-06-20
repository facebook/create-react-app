<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\PurchaseRequisition;

class PurchaseRequisitionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, PurchaseRequisition $pr): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, PurchaseRequisition $pr): bool
    {
        return $user->can('inventory.create');
    }

    public function approve(User $user, PurchaseRequisition $pr): bool
    {
        return $user->hasRole(['super-admin', 'admin', 'manager']);
    }

    public function delete(User $user, PurchaseRequisition $pr): bool
    {
        return $user->can('inventory.delete');
    }
}

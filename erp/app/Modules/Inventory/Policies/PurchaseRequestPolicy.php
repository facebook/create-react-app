<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\PurchaseRequest;

class PurchaseRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $user->can('inventory.create');
    }

    public function submit(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $user->can('inventory.create');
    }

    public function approve(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $user->can('inventory.create');
    }

    public function markOrdered(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $user->can('inventory.create');
    }

    public function reject(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $user->can('inventory.delete');
    }

    public function cancel(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $user->can('inventory.delete');
    }

    public function delete(User $user, PurchaseRequest $purchaseRequest): bool
    {
        return $user->can('inventory.delete');
    }
}

<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\ProductWarranty;
use App\Modules\Inventory\Models\WarrantyClaim;

class WarrantyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, ProductWarranty|WarrantyClaim $model): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, ProductWarranty|WarrantyClaim $model): bool
    {
        return $user->can('inventory.create');
    }

    public function approve(User $user, WarrantyClaim $claim): bool
    {
        return $user->can('inventory.create');
    }

    public function reject(User $user, WarrantyClaim $claim): bool
    {
        return $user->can('inventory.create');
    }

    public function resolve(User $user, WarrantyClaim $claim): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, ProductWarranty|WarrantyClaim $model): bool
    {
        return $user->can('inventory.delete');
    }
}

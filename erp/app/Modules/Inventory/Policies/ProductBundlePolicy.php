<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\ProductBundle;

class ProductBundlePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('inventory.view');
    }

    public function view(User $user, ProductBundle $productBundle): bool
    {
        return $user->hasPermissionTo('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('inventory.create');
    }

    public function update(User $user, ProductBundle $productBundle): bool
    {
        return $user->hasPermissionTo('inventory.create');
    }

    public function delete(User $user, ProductBundle $productBundle): bool
    {
        return $user->hasPermissionTo('inventory.delete');
    }
}

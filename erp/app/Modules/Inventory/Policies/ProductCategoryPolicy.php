<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\ProductCategory;

class ProductCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, ProductCategory $productCategory): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, ProductCategory $productCategory): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, ProductCategory $productCategory): bool
    {
        return $user->can('inventory.delete');
    }
}

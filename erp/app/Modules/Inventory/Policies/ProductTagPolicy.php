<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\ProductTag;

class ProductTagPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, ProductTag $productTag): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, ProductTag $productTag): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, ProductTag $productTag): bool
    {
        return $user->can('inventory.delete');
    }
}

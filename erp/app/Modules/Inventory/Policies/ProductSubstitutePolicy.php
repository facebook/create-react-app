<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\ProductSubstitute;

class ProductSubstitutePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, ProductSubstitute $productSubstitute): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, ProductSubstitute $productSubstitute): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, ProductSubstitute $productSubstitute): bool
    {
        return $user->can('inventory.delete');
    }
}

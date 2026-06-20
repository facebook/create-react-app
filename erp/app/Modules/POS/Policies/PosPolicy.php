<?php

namespace App\Modules\POS\Policies;

use App\Models\User;

class PosPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user): bool
    {
        return $user->can('inventory.delete');
    }
}

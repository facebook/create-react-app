<?php

namespace App\Modules\Marketing\Policies;

use App\Models\User;

class MarketingPolicy
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
        return $user->can('finance.create');
    }

    public function update(User $user): bool
    {
        return $user->can('finance.create');
    }

    public function delete(User $user): bool
    {
        return $user->can('finance.delete');
    }
}

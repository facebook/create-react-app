<?php

namespace App\Modules\Accounting\Policies;

use App\Models\User;

class AccountingPolicy
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
        return $user->can('finance.create');
    }
}

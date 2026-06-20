<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\ExpenseClaim;

class ExpenseClaimPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, ExpenseClaim $expenseClaim): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, ExpenseClaim $expenseClaim): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user, ExpenseClaim $expenseClaim): bool
    {
        return $user->can('hr.delete');
    }
}

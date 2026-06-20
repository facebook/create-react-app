<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\ExpenseBudget;

class ExpenseBudgetPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function view(User $user, ExpenseBudget $expenseBudget): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function update(User $user, ExpenseBudget $expenseBudget): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function freeze(User $user, ExpenseBudget $expenseBudget): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function close(User $user, ExpenseBudget $expenseBudget): bool
    {
        return $user->hasPermissionTo('finance.delete');
    }

    public function delete(User $user, ExpenseBudget $expenseBudget): bool
    {
        return $user->hasPermissionTo('finance.delete');
    }
}

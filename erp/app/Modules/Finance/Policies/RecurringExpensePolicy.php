<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;

class RecurringExpensePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function view(User $user, $model): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function update(User $user, $model): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function pause(User $user, $model): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function resume(User $user, $model): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function cancel(User $user, $model): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function delete(User $user, $model): bool
    {
        return $user->hasPermissionTo('finance.delete');
    }
}

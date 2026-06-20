<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;

class CashFlowForecastPolicy
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

    public function publish(User $user, $model): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function archive(User $user, $model): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function delete(User $user, $model): bool
    {
        return $user->hasPermissionTo('finance.delete');
    }
}

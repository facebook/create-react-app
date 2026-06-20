<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\ExchangeRate;

class ExchangeRatePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function view(User $user, ExchangeRate $model): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function delete(User $user, ExchangeRate $model): bool
    {
        return $user->hasPermissionTo('finance.delete');
    }
}

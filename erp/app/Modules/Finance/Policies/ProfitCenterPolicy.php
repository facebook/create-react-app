<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\ProfitCenter;

class ProfitCenterPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view');
    }

    public function view(User $user, ProfitCenter $profitCenter): bool
    {
        return $user->can('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->can('finance.create');
    }

    public function update(User $user, ProfitCenter $profitCenter): bool
    {
        return $user->can('finance.create');
    }

    public function activate(User $user, ProfitCenter $profitCenter): bool
    {
        return $user->can('finance.create');
    }

    public function deactivate(User $user, ProfitCenter $profitCenter): bool
    {
        return $user->can('finance.create');
    }

    public function delete(User $user, ProfitCenter $profitCenter): bool
    {
        return $user->can('finance.delete');
    }
}

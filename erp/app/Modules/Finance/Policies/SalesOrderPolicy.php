<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\SalesOrder;

class SalesOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view');
    }

    public function view(User $user, SalesOrder $salesOrder): bool
    {
        return $user->can('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->can('finance.create');
    }

    public function update(User $user, SalesOrder $salesOrder): bool
    {
        return $user->can('finance.update');
    }

    public function delete(User $user, SalesOrder $salesOrder): bool
    {
        return $user->can('finance.delete') && $salesOrder->status === 'draft';
    }
}

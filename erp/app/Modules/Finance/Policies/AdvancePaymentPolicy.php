<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\AdvancePayment;

class AdvancePaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view');
    }

    public function view(User $user, AdvancePayment $advancePayment): bool
    {
        return $user->can('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->can('finance.create');
    }

    public function update(User $user, AdvancePayment $advancePayment): bool
    {
        return $user->can('finance.create');
    }

    public function delete(User $user, AdvancePayment $advancePayment): bool
    {
        return $user->can('finance.delete');
    }
}

<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\CustomerCredit;

class CustomerCreditPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view');
    }

    public function view(User $user, CustomerCredit $customerCredit): bool
    {
        return $user->can('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->can('finance.create');
    }

    public function update(User $user, CustomerCredit $customerCredit): bool
    {
        return $user->can('finance.create');
    }

    public function issue(User $user, CustomerCredit $customerCredit): bool
    {
        return $user->can('finance.create');
    }

    public function apply(User $user, CustomerCredit $customerCredit): bool
    {
        return $user->can('finance.create');
    }

    public function expire(User $user, CustomerCredit $customerCredit): bool
    {
        return $user->can('finance.delete');
    }

    public function cancel(User $user, CustomerCredit $customerCredit): bool
    {
        return $user->can('finance.delete');
    }

    public function delete(User $user, CustomerCredit $customerCredit): bool
    {
        return $user->can('finance.delete');
    }
}

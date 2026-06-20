<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\VendorPayment;

class VendorPaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view');
    }

    public function view(User $user, VendorPayment $vendorPayment): bool
    {
        return $user->can('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->can('finance.create');
    }

    public function update(User $user, VendorPayment $vendorPayment): bool
    {
        return $user->can('finance.create');
    }

    public function approve(User $user, VendorPayment $vendorPayment): bool
    {
        return $user->can('finance.create');
    }

    public function process(User $user, VendorPayment $vendorPayment): bool
    {
        return $user->can('finance.create');
    }

    public function reject(User $user, VendorPayment $vendorPayment): bool
    {
        return $user->can('finance.delete');
    }

    public function cancel(User $user, VendorPayment $vendorPayment): bool
    {
        return $user->can('finance.delete');
    }

    public function delete(User $user, VendorPayment $vendorPayment): bool
    {
        return $user->can('finance.delete');
    }
}

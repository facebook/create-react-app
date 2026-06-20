<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\PaymentSchedule;

class PaymentSchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function view(User $user, PaymentSchedule $paymentSchedule): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function update(User $user, PaymentSchedule $paymentSchedule): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function pause(User $user, PaymentSchedule $paymentSchedule): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function resume(User $user, PaymentSchedule $paymentSchedule): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function cancel(User $user, PaymentSchedule $paymentSchedule): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function delete(User $user, PaymentSchedule $paymentSchedule): bool
    {
        return $user->hasPermissionTo('finance.delete');
    }
}

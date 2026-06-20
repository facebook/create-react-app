<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\PayrollRun;

class PayrollPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, PayrollRun $payrollRun): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, PayrollRun $payrollRun): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user, PayrollRun $payrollRun): bool
    {
        return $user->can('hr.delete');
    }
}

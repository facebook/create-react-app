<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\EmployeeLoan;

class LoanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, EmployeeLoan $loan): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, EmployeeLoan $loan): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user, EmployeeLoan $loan): bool
    {
        return $user->can('hr.delete');
    }
}

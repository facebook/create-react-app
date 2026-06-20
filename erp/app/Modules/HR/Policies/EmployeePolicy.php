<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\Employee;

class EmployeePolicy
{
    public function viewAny(User $user): bool { return $user->can('hr.view'); }
    public function view(User $user, Employee $employee): bool { return $user->can('hr.view'); }
    public function create(User $user): bool { return $user->can('hr.create'); }
    public function update(User $user, Employee $employee): bool { return $user->can('hr.update'); }
    public function delete(User $user, Employee $employee): bool
    {
        return $user->can('hr.delete')
            && in_array($employee->status, ['active', 'terminated']);
    }
}

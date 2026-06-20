<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\Department;

class DepartmentPolicy
{
    public function viewAny(User $user): bool { return $user->can('hr.view'); }
    public function view(User $user, Department $department): bool { return $user->can('hr.view'); }
    public function create(User $user): bool { return $user->can('hr.create'); }
    public function update(User $user, Department $department): bool { return $user->can('hr.update'); }
    public function delete(User $user, Department $department): bool { return $user->can('hr.delete'); }
}

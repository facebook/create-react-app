<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\LeaveRequest;

class LeaveRequestPolicy
{
    public function viewAny(User $user): bool { return $user->can('hr.view'); }
    public function view(User $user, LeaveRequest $leaveRequest): bool { return $user->can('hr.view'); }
    public function create(User $user): bool { return $user->can('hr.create'); }
    public function update(User $user, LeaveRequest $leaveRequest): bool { return $user->can('hr.update'); }
    public function delete(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->can('hr.delete')
            && in_array($leaveRequest->status, ['pending', 'cancelled']);
    }
}

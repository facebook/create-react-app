<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\TrainingSession;

class TrainingSessionPolicy
{
    public function viewAny(User $user): bool { return $user->hasPermissionTo('hr.view'); }
    public function view(User $user, TrainingSession $session): bool { return $user->hasPermissionTo('hr.view'); }
    public function create(User $user): bool { return $user->hasPermissionTo('hr.create'); }
    public function update(User $user, TrainingSession $session): bool { return $user->hasPermissionTo('hr.create'); }
    public function delete(User $user, TrainingSession $session): bool { return $user->hasPermissionTo('hr.delete'); }
    public function start(User $user, TrainingSession $session): bool { return $user->hasPermissionTo('hr.create'); }
    public function complete(User $user, TrainingSession $session): bool { return $user->hasPermissionTo('hr.create'); }
    public function cancel(User $user, TrainingSession $session): bool { return $user->hasPermissionTo('hr.create'); }
}

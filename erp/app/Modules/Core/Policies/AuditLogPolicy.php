<?php

namespace App\Modules\Core\Policies;

use App\Models\User;

class AuditLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['super-admin', 'admin']);
    }

    public function view(User $user, $model): bool
    {
        return $user->hasRole(['super-admin', 'admin']);
    }
}

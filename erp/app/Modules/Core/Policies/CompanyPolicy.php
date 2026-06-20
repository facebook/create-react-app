<?php

namespace App\Modules\Core\Policies;

use App\Models\User;
use App\Modules\Core\Models\Company;

class CompanyPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Company $company): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('admin') || $user->hasRole(['super-admin', 'admin']);
    }

    public function update(User $user, Company $company): bool
    {
        return $user->hasPermissionTo('admin') || $user->hasRole(['super-admin', 'admin']);
    }

    public function delete(User $user, Company $company): bool
    {
        return $user->hasPermissionTo('admin') || $user->hasRole(['super-admin', 'admin']);
    }
}

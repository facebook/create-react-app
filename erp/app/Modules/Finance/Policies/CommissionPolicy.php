<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\Commission;

class CommissionPolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user, Commission $commission): bool { return $user->can('finance.view'); }
    public function create(User $user): bool   { return $user->can('finance.create'); }
    public function update(User $user, Commission $commission): bool { return $user->can('finance.create'); }
    public function delete(User $user, Commission $commission): bool { return $user->can('finance.delete'); }
}

<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;

class SubscriptionPolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user): bool     { return $user->can('finance.view'); }
    public function create(User $user): bool   { return $user->can('finance.create'); }
    public function update(User $user): bool   { return $user->can('finance.create'); }
    public function delete(User $user): bool   { return $user->can('finance.delete'); }
}

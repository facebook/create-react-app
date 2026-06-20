<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\Account;

class AccountPolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user, Account $account): bool { return $user->can('finance.view'); }
    public function create(User $user): bool   { return $user->can('finance.create'); }
    public function update(User $user, Account $account): bool { return $user->can('finance.update'); }
    public function delete(User $user, Account $account): bool { return $user->can('finance.delete'); }
}

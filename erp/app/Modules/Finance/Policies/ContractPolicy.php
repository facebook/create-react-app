<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\Contract;

class ContractPolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user, Contract $contract): bool { return $user->can('finance.view'); }
    public function create(User $user): bool   { return $user->can('finance.create'); }
    public function update(User $user, Contract $contract): bool { return $user->can('finance.create'); }
    public function delete(User $user, Contract $contract): bool { return $user->can('finance.delete'); }
}

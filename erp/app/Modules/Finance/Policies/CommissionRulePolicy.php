<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\CommissionRule;

class CommissionRulePolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user, CommissionRule $rule): bool { return $user->can('finance.view'); }
    public function create(User $user): bool   { return $user->can('finance.create'); }
    public function update(User $user, CommissionRule $rule): bool { return $user->can('finance.create'); }
    public function delete(User $user, CommissionRule $rule): bool { return $user->can('finance.delete'); }
}

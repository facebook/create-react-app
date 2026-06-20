<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\PaymentTerm;

class PaymentTermPolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user, PaymentTerm $paymentTerm): bool { return $user->can('finance.view'); }
    public function create(User $user): bool { return $user->can('finance.create'); }
    public function update(User $user, PaymentTerm $paymentTerm): bool { return $user->can('finance.create'); }
    public function delete(User $user, PaymentTerm $paymentTerm): bool { return $user->can('finance.delete'); }
}

<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\BankTransfer;

class BankTransferPolicy
{
    public function viewAny(User $user): bool { return $user->can('finance.view'); }
    public function view(User $user, BankTransfer $bankTransfer): bool { return $user->can('finance.view'); }
    public function create(User $user): bool { return $user->can('finance.create'); }
    public function delete(User $user, BankTransfer $bankTransfer): bool { return $user->can('finance.delete'); }
}

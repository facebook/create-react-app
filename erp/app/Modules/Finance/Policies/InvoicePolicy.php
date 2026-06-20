<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\Invoice;

class InvoicePolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user, Invoice $invoice): bool { return $user->can('finance.view'); }
    public function create(User $user): bool   { return $user->can('finance.create'); }
    public function update(User $user, Invoice $invoice): bool { return $user->can('finance.update'); }
    public function delete(User $user, Invoice $invoice): bool { return $user->can('finance.delete') && $invoice->status === 'draft'; }
}

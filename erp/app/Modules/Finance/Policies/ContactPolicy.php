<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\Contact;

class ContactPolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user, Contact $contact): bool { return $user->can('finance.view'); }
    public function create(User $user): bool   { return $user->can('finance.create'); }
    public function update(User $user, Contact $contact): bool { return $user->can('finance.update'); }
    public function delete(User $user, Contact $contact): bool { return $user->can('finance.delete'); }
}

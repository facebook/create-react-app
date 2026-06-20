<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\JournalEntry;

class JournalEntryPolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user, JournalEntry $entry): bool { return $user->can('finance.view'); }
    public function create(User $user): bool   { return $user->can('finance.create'); }
    public function update(User $user, JournalEntry $entry): bool { return $user->can('finance.update') && $entry->status === 'draft'; }
    public function delete(User $user, JournalEntry $entry): bool { return $user->can('finance.delete') && $entry->status === 'draft'; }
}

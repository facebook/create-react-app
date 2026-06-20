<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\DeliveryNote;

class DeliveryNotePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view');
    }

    public function view(User $user, DeliveryNote $dn): bool
    {
        return $user->can('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->can('finance.create');
    }

    public function update(User $user, DeliveryNote $dn): bool
    {
        return $user->can('finance.create');
    }

    public function delete(User $user, DeliveryNote $dn): bool
    {
        return $user->can('finance.delete');
    }
}

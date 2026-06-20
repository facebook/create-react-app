<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\RmaRequest;

class RmaRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, RmaRequest $rmaRequest): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, RmaRequest $rmaRequest): bool
    {
        return $user->can('inventory.create');
    }

    public function approve(User $user, RmaRequest $rmaRequest): bool
    {
        return $user->can('inventory.create');
    }

    public function receive(User $user, RmaRequest $rmaRequest): bool
    {
        return $user->can('inventory.create');
    }

    public function inspect(User $user, RmaRequest $rmaRequest): bool
    {
        return $user->can('inventory.create');
    }

    public function close(User $user, RmaRequest $rmaRequest): bool
    {
        return $user->can('inventory.create');
    }

    public function reject(User $user, RmaRequest $rmaRequest): bool
    {
        return $user->can('inventory.delete');
    }

    public function delete(User $user, RmaRequest $rmaRequest): bool
    {
        return $user->can('inventory.delete');
    }
}

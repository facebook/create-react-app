<?php

namespace App\Modules\Manufacturing\Policies;

use App\Models\User;
use App\Modules\Manufacturing\Models\WorkOrder;

class WorkOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, WorkOrder $workOrder): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, WorkOrder $workOrder): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, WorkOrder $workOrder): bool
    {
        return $user->can('inventory.delete');
    }
}

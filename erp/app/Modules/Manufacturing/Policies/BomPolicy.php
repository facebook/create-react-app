<?php

namespace App\Modules\Manufacturing\Policies;

use App\Models\User;
use App\Modules\Manufacturing\Models\BillOfMaterials;

class BomPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, BillOfMaterials $bom): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, BillOfMaterials $bom): bool
    {
        return $user->can('inventory.create');
    }

    public function delete(User $user, BillOfMaterials $bom): bool
    {
        return $user->can('inventory.delete');
    }
}

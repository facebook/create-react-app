<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductVariantPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool { return $user->hasPermissionTo('inventory.view'); }
    public function view(User $user, $model): bool { return $user->hasPermissionTo('inventory.view'); }
    public function create(User $user): bool { return $user->hasPermissionTo('inventory.create'); }
    public function update(User $user, $model): bool { return $user->hasPermissionTo('inventory.create'); }
    public function delete(User $user, $model): bool { return $user->hasPermissionTo('inventory.delete'); }
}

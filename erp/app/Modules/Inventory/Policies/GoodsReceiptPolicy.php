<?php

namespace App\Modules\Inventory\Policies;

use App\Models\User;
use App\Modules\Inventory\Models\GoodsReceipt;

class GoodsReceiptPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.view');
    }

    public function view(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return $user->can('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.create');
    }

    public function update(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return $user->can('inventory.create');
    }

    public function confirm(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return $user->can('inventory.create');
    }

    public function post(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return $user->can('inventory.create');
    }

    public function reject(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return $user->can('inventory.delete');
    }

    public function delete(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return $user->can('inventory.delete');
    }
}

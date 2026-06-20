<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\TaxGroup;
use App\Modules\Finance\Models\TaxGroupItem;
use App\Modules\Finance\Models\TaxRate;

class TaxPolicy
{
    public function viewAny(User $user): bool  { return $user->can('finance.view'); }
    public function view(User $user, mixed $model): bool { return $user->can('finance.view'); }
    public function create(User $user, mixed $model = null): bool { return $user->can('finance.create'); }
    public function update(User $user, mixed $model): bool { return $user->can('finance.create'); }
    public function delete(User $user, mixed $model): bool { return $user->can('finance.delete'); }
}

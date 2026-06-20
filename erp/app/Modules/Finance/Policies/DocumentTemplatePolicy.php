<?php

namespace App\Modules\Finance\Policies;

use App\Models\User;
use App\Modules\Finance\Models\DocumentTemplate;

class DocumentTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function view(User $user, DocumentTemplate $model): bool
    {
        return $user->hasPermissionTo('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function update(User $user, DocumentTemplate $model): bool
    {
        return $user->hasPermissionTo('finance.create');
    }

    public function delete(User $user, DocumentTemplate $model): bool
    {
        return $user->hasPermissionTo('finance.delete');
    }
}

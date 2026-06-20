<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\OnboardingTemplate;

class OnboardingTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, OnboardingTemplate $template): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, OnboardingTemplate $template): bool
    {
        return $user->can('hr.update');
    }

    public function delete(User $user, OnboardingTemplate $template): bool
    {
        return $user->can('hr.delete');
    }
}

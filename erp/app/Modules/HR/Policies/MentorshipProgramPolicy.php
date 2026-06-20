<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\MentorshipProgram;

class MentorshipProgramPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, MentorshipProgram $mentorshipProgram): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, MentorshipProgram $mentorshipProgram): bool
    {
        return $user->can('hr.create');
    }

    public function complete(User $user, MentorshipProgram $mentorshipProgram): bool
    {
        return $user->can('hr.create');
    }

    public function pause(User $user, MentorshipProgram $mentorshipProgram): bool
    {
        return $user->can('hr.create');
    }

    public function resume(User $user, MentorshipProgram $mentorshipProgram): bool
    {
        return $user->can('hr.create');
    }

    public function cancel(User $user, MentorshipProgram $mentorshipProgram): bool
    {
        return $user->can('hr.create');
    }

    public function logSession(User $user, MentorshipProgram $mentorshipProgram): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user, MentorshipProgram $mentorshipProgram): bool
    {
        return $user->can('hr.delete');
    }
}

<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Modules\HR\Models\InterviewSchedule;

class InterviewSchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.view');
    }

    public function view(User $user, InterviewSchedule $interviewSchedule): bool
    {
        return $user->can('hr.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.create');
    }

    public function update(User $user, InterviewSchedule $interviewSchedule): bool
    {
        return $user->can('hr.create');
    }

    public function confirm(User $user, InterviewSchedule $interviewSchedule): bool
    {
        return $user->can('hr.create');
    }

    public function complete(User $user, InterviewSchedule $interviewSchedule): bool
    {
        return $user->can('hr.create');
    }

    public function cancel(User $user, InterviewSchedule $interviewSchedule): bool
    {
        return $user->can('hr.create');
    }

    public function delete(User $user, InterviewSchedule $interviewSchedule): bool
    {
        return $user->can('hr.delete');
    }

    public function markNoShow(User $user, InterviewSchedule $interviewSchedule): bool
    {
        return $user->can('hr.delete');
    }
}

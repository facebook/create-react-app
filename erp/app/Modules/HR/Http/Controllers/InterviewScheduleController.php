<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\InterviewSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InterviewScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', InterviewSchedule::class);

        $interviews = InterviewSchedule::with('interviewer')
            ->latest()
            ->paginate(15);

        return Inertia::render('HR/InterviewSchedules/Index', [
            'interviews' => $interviews,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', InterviewSchedule::class);

        return Inertia::render('HR/InterviewSchedules/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', InterviewSchedule::class);

        $data = $request->validate([
            'candidate_name'   => ['required', 'string', 'max:255'],
            'position_title'   => ['required', 'string', 'max:255'],
            'scheduled_at'     => ['required', 'date'],
            'candidate_email'  => ['nullable', 'email', 'max:255'],
            'interview_type'   => ['nullable', 'in:in-person,video,phone,panel'],
            'duration_minutes' => ['nullable', 'integer', 'min:15'],
            'location'         => ['nullable', 'string', 'max:255'],
            'meeting_link'     => ['nullable', 'string', 'max:255'],
            'notes'            => ['nullable', 'string'],
            'interviewer_id'   => ['nullable', 'exists:users,id'],
            'job_application_id' => ['nullable', 'exists:job_applications,id'],
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        InterviewSchedule::create($data);

        return redirect()->route('hr.interview-schedules.index')
            ->with('success', 'Interview schedule created.');
    }

    public function show(InterviewSchedule $interviewSchedule): Response
    {
        $this->authorize('view', $interviewSchedule);

        $interviewSchedule->load('interviewer', 'jobApplication', 'createdBy');

        return Inertia::render('HR/InterviewSchedules/Show', [
            'interview' => $interviewSchedule,
        ]);
    }

    public function edit(InterviewSchedule $interviewSchedule): Response
    {
        $this->authorize('update', $interviewSchedule);

        return Inertia::render('HR/InterviewSchedules/Edit', [
            'interview' => $interviewSchedule,
        ]);
    }

    public function update(Request $request, InterviewSchedule $interviewSchedule): RedirectResponse
    {
        $this->authorize('update', $interviewSchedule);

        $data = $request->validate([
            'candidate_name'   => ['required', 'string', 'max:255'],
            'position_title'   => ['required', 'string', 'max:255'],
            'scheduled_at'     => ['required', 'date'],
            'candidate_email'  => ['nullable', 'email', 'max:255'],
            'interview_type'   => ['nullable', 'in:in-person,video,phone,panel'],
            'duration_minutes' => ['nullable', 'integer', 'min:15'],
            'location'         => ['nullable', 'string', 'max:255'],
            'meeting_link'     => ['nullable', 'string', 'max:255'],
            'notes'            => ['nullable', 'string'],
            'interviewer_id'   => ['nullable', 'exists:users,id'],
        ]);

        $interviewSchedule->update($data);

        return redirect()->route('hr.interview-schedules.index')
            ->with('success', 'Interview schedule updated.');
    }

    public function destroy(InterviewSchedule $interviewSchedule): RedirectResponse
    {
        $this->authorize('delete', $interviewSchedule);

        $interviewSchedule->delete();

        return redirect()->route('hr.interview-schedules.index')
            ->with('success', 'Interview schedule deleted.');
    }

    public function confirm(InterviewSchedule $interviewSchedule): RedirectResponse
    {
        $this->authorize('confirm', $interviewSchedule);

        $interviewSchedule->confirm();

        return redirect()->route('hr.interview-schedules.index')
            ->with('success', 'Interview confirmed.');
    }

    public function complete(Request $request, InterviewSchedule $interviewSchedule): RedirectResponse
    {
        $this->authorize('complete', $interviewSchedule);

        $request->validate([
            'outcome'  => ['nullable', 'string', 'in:pass,fail,hold'],
            'feedback' => ['nullable', 'string'],
        ]);

        $interviewSchedule->complete($request->outcome, $request->feedback);

        return redirect()->route('hr.interview-schedules.index')
            ->with('success', 'Interview completed.');
    }

    public function cancel(InterviewSchedule $interviewSchedule): RedirectResponse
    {
        $this->authorize('cancel', $interviewSchedule);

        $interviewSchedule->cancel();

        return redirect()->route('hr.interview-schedules.index')
            ->with('success', 'Interview cancelled.');
    }

    public function noShow(InterviewSchedule $interviewSchedule): RedirectResponse
    {
        $this->authorize('markNoShow', $interviewSchedule);

        $interviewSchedule->markNoShow();

        return redirect()->route('hr.interview-schedules.index')
            ->with('success', 'Interview marked as no-show.');
    }
}

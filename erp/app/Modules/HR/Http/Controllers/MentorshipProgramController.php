<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\MentorshipProgram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MentorshipProgramController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', MentorshipProgram::class);

        $query = MentorshipProgram::with(['mentor', 'mentee'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $programs = $query->paginate(15);
        $filters  = $request->only(['status']);

        return Inertia::render('HR/MentorshipPrograms/Index', compact('programs', 'filters'));
    }

    public function create(): Response
    {
        $this->authorize('create', MentorshipProgram::class);

        $employees = Employee::where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/MentorshipPrograms/Create', compact('employees'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', MentorshipProgram::class);

        $data = $request->validate([
            'mentor_id'         => ['required', 'exists:employees,id'],
            'mentee_id'         => ['required', 'exists:employees,id'],
            'title'             => ['required', 'string'],
            'start_date'        => ['required', 'date'],
            'objectives'        => ['nullable', 'string'],
            'end_date'          => ['nullable', 'date'],
            'status'            => ['nullable', 'string'],
            'meeting_frequency' => ['nullable', 'string'],
            'sessions_planned'  => ['nullable', 'integer'],
            'notes'             => ['nullable', 'string'],
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        MentorshipProgram::create($data);

        return redirect()->route('hr.mentorship-programs.index');
    }

    public function show(MentorshipProgram $mentorshipProgram): Response
    {
        $this->authorize('view', $mentorshipProgram);

        $mentorshipProgram->load(['mentor', 'mentee']);

        return Inertia::render('HR/MentorshipPrograms/Show', compact('mentorshipProgram'));
    }

    public function edit(MentorshipProgram $mentorshipProgram): Response
    {
        $this->authorize('update', $mentorshipProgram);

        $employees = Employee::where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        $mentorshipProgram->load(['mentor', 'mentee']);

        return Inertia::render('HR/MentorshipPrograms/Edit', compact('mentorshipProgram', 'employees'));
    }

    public function update(Request $request, MentorshipProgram $mentorshipProgram): RedirectResponse
    {
        $this->authorize('update', $mentorshipProgram);

        $data = $request->validate([
            'mentor_id'         => ['required', 'exists:employees,id'],
            'mentee_id'         => ['required', 'exists:employees,id'],
            'title'             => ['required', 'string'],
            'start_date'        => ['required', 'date'],
            'objectives'        => ['nullable', 'string'],
            'end_date'          => ['nullable', 'date'],
            'status'            => ['nullable', 'string'],
            'meeting_frequency' => ['nullable', 'string'],
            'sessions_planned'  => ['nullable', 'integer'],
            'notes'             => ['nullable', 'string'],
        ]);

        $mentorshipProgram->update($data);

        return redirect()->route('hr.mentorship-programs.index');
    }

    public function destroy(MentorshipProgram $mentorshipProgram): RedirectResponse
    {
        $this->authorize('delete', $mentorshipProgram);

        $mentorshipProgram->delete();

        return redirect()->route('hr.mentorship-programs.index');
    }

    public function complete(MentorshipProgram $mentorshipProgram): RedirectResponse
    {
        $this->authorize('complete', $mentorshipProgram);

        $mentorshipProgram->complete();

        return redirect()->route('hr.mentorship-programs.index');
    }

    public function pause(MentorshipProgram $mentorshipProgram): RedirectResponse
    {
        $this->authorize('pause', $mentorshipProgram);

        $mentorshipProgram->pause();

        return redirect()->route('hr.mentorship-programs.index');
    }

    public function resume(MentorshipProgram $mentorshipProgram): RedirectResponse
    {
        $this->authorize('resume', $mentorshipProgram);

        $mentorshipProgram->resume();

        return redirect()->route('hr.mentorship-programs.index');
    }

    public function cancel(MentorshipProgram $mentorshipProgram): RedirectResponse
    {
        $this->authorize('cancel', $mentorshipProgram);

        $mentorshipProgram->cancel();

        return redirect()->route('hr.mentorship-programs.index');
    }

    public function logSession(MentorshipProgram $mentorshipProgram): RedirectResponse
    {
        $this->authorize('logSession', $mentorshipProgram);

        $mentorshipProgram->logSession();

        return redirect()->route('hr.mentorship-programs.index');
    }
}

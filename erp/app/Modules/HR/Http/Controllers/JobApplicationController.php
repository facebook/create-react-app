<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\JobApplication;
use App\Modules\HR\Models\JobPosition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JobApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', JobApplication::class);

        $query = JobApplication::with('jobPosition')->latest();

        if ($request->filled('job_position_id')) {
            $query->where('job_position_id', $request->job_position_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->paginate(15);

        return Inertia::render('HR/JobApplications/Index', compact('applications'));
    }

    public function create(): Response
    {
        $this->authorize('create', JobApplication::class);

        $positions = JobPosition::where('is_active', true)->orWhere('status', 'open')
            ->orderBy('title')->get(['id', 'title']);

        return Inertia::render('HR/JobApplications/Create', compact('positions'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', JobApplication::class);

        $data = $request->validate([
            'job_position_id'  => ['required', Rule::exists('job_positions', 'id')],
            'applicant_name'   => ['required', 'string', 'max:255'],
            'applicant_email'  => ['required', 'email', 'max:255'],
            'applicant_phone'  => ['nullable', 'string', 'max:50'],
            'cover_letter'     => ['nullable', 'string'],
            'resume_url'       => ['nullable', 'string'],
            'source'           => ['nullable', 'string', 'max:100'],
            'rating'           => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['status']    = 'new';

        $application = JobApplication::create($data);

        return redirect()->back()->with('success', 'Job application created.');
    }

    public function show(JobApplication $jobApplication): Response
    {
        $this->authorize('view', $jobApplication);

        $jobApplication->load('jobPosition', 'reviewer');

        return Inertia::render('HR/JobApplications/Show', [
            'application' => $jobApplication,
        ]);
    }

    public function destroy(JobApplication $jobApplication): RedirectResponse
    {
        $this->authorize('delete', $jobApplication);

        $jobApplication->delete();

        return redirect()->back()->with('success', 'Job application deleted.');
    }

    public function advance(Request $request, JobApplication $jobApplication): RedirectResponse
    {
        $this->authorize('update', $jobApplication);

        $validStages = ['screening', 'interview', 'offer', 'applied', 'hired', 'rejected'];

        $data = $request->validate([
            'status' => ['nullable', Rule::in($validStages)],
            'stage'  => ['nullable', Rule::in($validStages)],
        ]);

        $newStatus = $data['status'] ?? $data['stage'] ?? null;

        if ($newStatus === null) {
            return back()->withErrors(['status' => 'A status is required.']);
        }

        $jobApplication->advance($newStatus);

        return redirect()->back()->with('success', 'Application status updated.');
    }

    public function hire(JobApplication $jobApplication): RedirectResponse
    {
        $this->authorize('update', $jobApplication);

        $jobApplication->hire();

        return redirect()->back()->with('success', 'Applicant hired.');
    }

    public function reject(Request $request, JobApplication $jobApplication): RedirectResponse
    {
        $this->authorize('update', $jobApplication);

        $request->validate([
            'notes'  => ['nullable', 'string'],
            'reason' => ['nullable', 'string'],
        ]);

        $notes = $request->notes ?? $request->reason ?? '';
        $jobApplication->reject($notes);

        return redirect()->back()->with('success', 'Application rejected.');
    }
}

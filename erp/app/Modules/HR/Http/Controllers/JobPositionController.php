<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\JobPosition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JobPositionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', JobPosition::class);

        $query = JobPosition::with('department')
            ->withCount('applications')
            ->latest();

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $positions = $query->paginate(15);

        return Inertia::render('HR/JobPositions/Index', compact('positions'));
    }

    public function create(): Response
    {
        $this->authorize('create', JobPosition::class);

        $departments = Department::orderBy('name')->get(['id', 'name']);

        return Inertia::render('HR/JobPositions/Create', compact('departments'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', JobPosition::class);

        $data = $request->validate([
            'title'           => ['required', 'string', 'max:255'],
            'employment_type' => ['required', Rule::in(['full_time', 'part_time', 'contract', 'internship'])],
            'department'      => ['nullable', 'string', 'max:255'],
            'department_id'   => ['nullable', Rule::exists('departments', 'id')],
            'location'        => ['nullable', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'requirements'    => ['nullable', 'string'],
            'salary_min'      => ['nullable', 'numeric', 'min:0'],
            'salary_max'      => ['nullable', 'numeric', 'min:0'],
            'openings'        => ['integer', 'min:1'],
            'is_active'       => ['boolean'],
            'posted_at'       => ['nullable', 'date'],
            'closes_at'       => ['nullable', 'date'],
        ]);

        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['openings']  = $data['openings'] ?? 1;
        $data['is_active'] = $data['is_active'] ?? true;

        $position = JobPosition::create($data);

        return redirect()->back()->with('success', 'Job position created.');
    }

    public function show(JobPosition $jobPosition): Response
    {
        $this->authorize('view', $jobPosition);

        $jobPosition->load([
            'department',
            'applications' => fn ($q) => $q->latest(),
        ]);

        return Inertia::render('HR/JobPositions/Show', [
            'position' => $jobPosition,
        ]);
    }

    public function destroy(JobPosition $jobPosition): RedirectResponse
    {
        $this->authorize('delete', $jobPosition);

        $jobPosition->delete();

        return redirect()->back()->with('success', 'Job position deleted.');
    }

    public function publish(JobPosition $jobPosition): RedirectResponse
    {
        $this->authorize('update', $jobPosition);

        $jobPosition->publish();

        return redirect()->back()->with('success', 'Job position published.');
    }

    public function close(JobPosition $jobPosition): RedirectResponse
    {
        $this->authorize('update', $jobPosition);

        $jobPosition->close();

        return redirect()->back()->with('success', 'Job position closed.');
    }
}

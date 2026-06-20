<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeOnboarding;
use App\Modules\HR\Models\OnboardingChecklist;
use App\Modules\HR\Models\OnboardingProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeOnboardingTrackingController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeeOnboarding::class);

        $query = EmployeeOnboarding::with(['employee', 'checklist'])
            ->whereNotNull('onboarding_checklist_id');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $onboardings = $query->orderByDesc('created_at')->paginate(20);

        $employees  = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);
        $checklists = OnboardingChecklist::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('HR/EmployeeOnboardings/Index', [
            'onboardings' => $onboardings,
            'employees'   => $employees,
            'checklists'  => $checklists,
            'filters'     => $request->only(['employee_id', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', EmployeeOnboarding::class);

        $employees  = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);
        $checklists = OnboardingChecklist::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('HR/EmployeeOnboardings/Create', [
            'employees'  => $employees,
            'checklists' => $checklists,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeOnboarding::class);

        $validated = $request->validate([
            'employee_id'             => 'required|exists:employees,id',
            'onboarding_checklist_id' => 'required|exists:onboarding_checklists,id',
            'start_date'              => 'required|date',
        ]);

        $checklist = OnboardingChecklist::with('tasks')->findOrFail($validated['onboarding_checklist_id']);

        $onboarding = EmployeeOnboarding::create([
            'tenant_id'               => auth()->user()->tenant_id,
            'employee_id'             => $validated['employee_id'],
            'onboarding_checklist_id' => $validated['onboarding_checklist_id'],
            'start_date'              => $validated['start_date'],
            'started_at'              => $validated['start_date'],
            'title'                   => $checklist->name,
            'status'                  => 'in_progress',
            'assigned_by'             => auth()->id(),
        ]);

        foreach ($checklist->tasks as $task) {
            OnboardingProgress::create([
                'tenant_id'              => auth()->user()->tenant_id,
                'employee_onboarding_id' => $onboarding->id,
                'onboarding_task_id'     => $task->id,
                'status'                 => 'pending',
            ]);
        }

        return redirect()->route('hr.employee-onboardings.show', $onboarding)
            ->with('success', 'Employee onboarding created.');
    }

    public function show(EmployeeOnboarding $employeeOnboarding): Response
    {
        $this->authorize('view', $employeeOnboarding);

        $employeeOnboarding->load(['employee', 'checklist.tasks', 'progress.task']);

        return Inertia::render('HR/EmployeeOnboardings/Show', [
            'onboarding' => $employeeOnboarding,
        ]);
    }

    public function completeTask(Request $request, EmployeeOnboarding $employeeOnboarding, OnboardingProgress $progress): RedirectResponse
    {
        $this->authorize('update', $employeeOnboarding);

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $progress->complete(auth()->user(), $validated['notes'] ?? null);

        return back()->with('success', 'Task completed.');
    }

    public function skipTask(Request $request, EmployeeOnboarding $employeeOnboarding, OnboardingProgress $progress): RedirectResponse
    {
        $this->authorize('update', $employeeOnboarding);

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $progress->skip($validated['notes'] ?? null);

        return back()->with('success', 'Task skipped.');
    }

    public function destroy(EmployeeOnboarding $employeeOnboarding): RedirectResponse
    {
        $this->authorize('delete', $employeeOnboarding);

        $employeeOnboarding->delete();

        return redirect()->route('hr.employee-onboardings.index')
            ->with('success', 'Onboarding deleted.');
    }
}

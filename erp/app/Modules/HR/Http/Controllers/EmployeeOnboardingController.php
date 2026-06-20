<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeOnboarding;
use App\Modules\HR\Models\EmployeeOnboardingTask;
use App\Modules\HR\Models\OnboardingTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeOnboardingController extends Controller
{
    public function index(Employee $employee): Response
    {
        $this->authorize('viewAny', EmployeeOnboarding::class);

        $onboardings = $employee->onboardings()
            ->withCount('tasks')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($onboarding) {
                $onboarding->progress = $onboarding->progress;
                return $onboarding;
            });

        return Inertia::render('HR/Employees/Onboardings/Index', [
            'employee'    => $employee,
            'onboardings' => $onboardings,
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Employees', 'href' => route('hr.employees.index')],
                ['label' => $employee->full_name, 'href' => route('hr.employees.show', $employee)],
                ['label' => 'Onboardings'],
            ],
        ]);
    }

    public function create(Employee $employee): Response
    {
        $this->authorize('create', EmployeeOnboarding::class);

        $templates = OnboardingTemplate::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('HR/Employees/Onboardings/Create', [
            'employee'    => $employee,
            'templates'   => $templates,
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Employees', 'href' => route('hr.employees.index')],
                ['label' => $employee->full_name, 'href' => route('hr.employees.show', $employee)],
                ['label' => 'Onboardings', 'href' => route('hr.employees.onboardings.index', $employee)],
                ['label' => 'New Onboarding'],
            ],
        ]);
    }

    public function store(Request $request, Employee $employee): RedirectResponse
    {
        $this->authorize('create', EmployeeOnboarding::class);

        $validated = $request->validate([
            'template_id' => 'nullable|exists:onboarding_templates,id',
            'title'       => 'nullable|string|max:255',
            'started_at'  => 'required|date',
        ]);

        if ($validated['template_id']) {
            $template = OnboardingTemplate::findOrFail($validated['template_id']);
            $onboarding = EmployeeOnboarding::fromTemplate($employee, $template);
            // Override started_at if explicitly provided
            if ($validated['started_at']) {
                $onboarding->update(['started_at' => $validated['started_at']]);
            }
        } else {
            $onboarding = EmployeeOnboarding::create([
                'tenant_id'   => $employee->tenant_id,
                'employee_id' => $employee->id,
                'template_id' => null,
                'title'       => $validated['title'] ?? 'Onboarding',
                'status'      => 'in_progress',
                'started_at'  => $validated['started_at'],
            ]);
        }

        return redirect()->route('hr.employees.onboardings.show', [$employee, $onboarding])
            ->with('success', 'Onboarding created.');
    }

    public function show(Employee $employee, EmployeeOnboarding $onboarding): Response
    {
        $this->authorize('view', $onboarding);

        $onboarding->load('tasks');

        return Inertia::render('HR/Employees/Onboardings/Show', [
            'employee'    => $employee,
            'onboarding'  => array_merge($onboarding->toArray(), ['progress' => $onboarding->progress]),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Employees', 'href' => route('hr.employees.index')],
                ['label' => $employee->full_name, 'href' => route('hr.employees.show', $employee)],
                ['label' => 'Onboardings', 'href' => route('hr.employees.onboardings.index', $employee)],
                ['label' => $onboarding->title],
            ],
        ]);
    }

    public function completeTask(Employee $employee, EmployeeOnboarding $onboarding, EmployeeOnboardingTask $task): RedirectResponse
    {
        $this->authorize('update', $onboarding);

        $task->update([
            'completed_at' => now(),
            'completed_by' => auth()->id(),
        ]);

        return back()->with('success', 'Task marked as complete.');
    }

    public function uncompleteTask(Employee $employee, EmployeeOnboarding $onboarding, EmployeeOnboardingTask $task): RedirectResponse
    {
        $this->authorize('update', $onboarding);

        $task->update([
            'completed_at' => null,
            'completed_by' => null,
        ]);

        return back()->with('success', 'Task marked as incomplete.');
    }

    public function complete(Employee $employee, EmployeeOnboarding $onboarding): RedirectResponse
    {
        $this->authorize('update', $onboarding);

        $onboarding->update([
            'status'       => 'completed',
            'completed_at' => now()->toDateString(),
        ]);

        return back()->with('success', 'Onboarding marked as complete.');
    }

    public function destroy(Employee $employee, EmployeeOnboarding $onboarding): RedirectResponse
    {
        $this->authorize('delete', $onboarding);

        $onboarding->delete();

        return redirect()->route('hr.employees.onboardings.index', $employee)
            ->with('success', 'Onboarding deleted.');
    }
}

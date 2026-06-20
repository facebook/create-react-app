<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeGoal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeGoalController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeeGoal::class);

        $query = EmployeeGoal::with('employee')
            ->orderByDesc('created_at');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $goals   = $query->paginate(15);
        $filters = $request->only(['employee_id', 'status']);

        return Inertia::render('HR/EmployeeGoals/Index', compact('goals', 'filters'));
    }

    public function create(): Response
    {
        $this->authorize('create', EmployeeGoal::class);

        $employees = Employee::where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/EmployeeGoals/Create', compact('employees'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeGoal::class);

        $data = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'title'       => ['required', 'string'],
            'start_date'  => ['required', 'date'],
            'due_date'    => ['required', 'date', 'after_or_equal:start_date'],
            'priority'    => ['nullable', 'in:low,medium,high'],
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        EmployeeGoal::create($data);

        return redirect()->route('hr.employee-goals.index');
    }

    public function show(EmployeeGoal $employeeGoal): Response
    {
        $this->authorize('view', $employeeGoal);

        $employeeGoal->load('employee');

        return Inertia::render('HR/EmployeeGoals/Show', compact('employeeGoal'));
    }

    public function edit(EmployeeGoal $employeeGoal): Response
    {
        $this->authorize('update', $employeeGoal);

        $employees = Employee::where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        $employeeGoal->load('employee');

        return Inertia::render('HR/EmployeeGoals/Edit', compact('employeeGoal', 'employees'));
    }

    public function update(Request $request, EmployeeGoal $employeeGoal): RedirectResponse
    {
        $this->authorize('update', $employeeGoal);

        $data = $request->validate([
            'title'      => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'due_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'priority'   => ['nullable', 'in:low,medium,high'],
        ]);

        $employeeGoal->update($data);

        return redirect()->route('hr.employee-goals.index');
    }

    public function destroy(EmployeeGoal $employeeGoal): RedirectResponse
    {
        $this->authorize('delete', $employeeGoal);

        $employeeGoal->delete();

        return redirect()->route('hr.employee-goals.index');
    }

    public function complete(EmployeeGoal $employeeGoal): RedirectResponse
    {
        $this->authorize('complete', $employeeGoal);

        $employeeGoal->complete();

        return redirect()->route('hr.employee-goals.index');
    }

    public function miss(EmployeeGoal $employeeGoal): RedirectResponse
    {
        $this->authorize('miss', $employeeGoal);

        $employeeGoal->miss();

        return redirect()->route('hr.employee-goals.index');
    }

    public function cancel(EmployeeGoal $employeeGoal): RedirectResponse
    {
        $this->authorize('cancel', $employeeGoal);

        $employeeGoal->cancel();

        return redirect()->route('hr.employee-goals.index');
    }

    public function updateProgress(Request $request, EmployeeGoal $employeeGoal): RedirectResponse
    {
        $this->authorize('update', $employeeGoal);

        $data = $request->validate([
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $employeeGoal->updateProgress($data['progress']);

        return redirect()->route('hr.employee-goals.index');
    }
}

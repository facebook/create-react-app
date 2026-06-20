<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\HR\Http\Requests\StoreEmployeeRequest;
use App\Modules\HR\Http\Resources\EmployeeResource;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Employee::class);

        $employees = Employee::with('department')
            ->when($request->search, fn ($q) => $q->search($request->search))
            ->when($request->department_id, fn ($q) => $q->where('department_id', $request->department_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('last_name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('HR/Employees/Index', [
            'employees'   => EmployeeResource::collection($employees),
            'departments' => Department::active()->orderBy('name')->get(['id', 'name']),
            'filters'     => $request->only(['search', 'department_id', 'status']),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Employees', 'href' => route('hr.employees.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Employee::class);

        return Inertia::render('HR/Employees/Create', [
            'departments' => Department::active()->orderBy('name')->get(['id', 'name']),
            'users'       => User::orderBy('name')->get(['id', 'name', 'email']),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Employees', 'href' => route('hr.employees.index')],
                ['label' => 'New Employee'],
            ],
        ]);
    }

    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        $this->authorize('create', Employee::class);

        $employee = Employee::create([
            ...$request->validated(),
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        // Generate employee code
        if (!$employee->employee_number) {
            $employee->employee_number = 'EMP-' . str_pad((string) $employee->id, 5, '0', STR_PAD_LEFT);
            $employee->save();
        }

        return redirect()->route('hr.employees.show', $employee)
            ->with('success', 'Employee created.');
    }

    public function show(Employee $employee): Response
    {
        $this->authorize('view', $employee);

        $employee->load(['department', 'user', 'leaveRequests.leaveType']);

        return Inertia::render('HR/Employees/Show', [
            'employee'    => new EmployeeResource($employee),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Employees', 'href' => route('hr.employees.index')],
                ['label' => $employee->full_name],
            ],
        ]);
    }

    public function edit(Employee $employee): Response
    {
        $this->authorize('update', $employee);

        return Inertia::render('HR/Employees/Edit', [
            'employee'    => new EmployeeResource($employee),
            'departments' => Department::active()->orderBy('name')->get(['id', 'name']),
            'users'       => User::orderBy('name')->get(['id', 'name', 'email']),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Employees', 'href' => route('hr.employees.index')],
                ['label' => $employee->full_name, 'href' => route('hr.employees.show', $employee)],
                ['label' => 'Edit'],
            ],
        ]);
    }

    public function update(StoreEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $this->authorize('update', $employee);

        $employee->update($request->validated());

        return redirect()->route('hr.employees.show', $employee)
            ->with('success', 'Employee updated.');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $this->authorize('delete', $employee);

        $employee->delete();

        return redirect()->route('hr.employees.index')
            ->with('success', 'Employee deleted.');
    }

    public function terminate(Employee $employee): RedirectResponse
    {
        $this->authorize('update', $employee);

        if ($employee->status !== 'active') {
            return back()->withErrors(['status' => 'Only active employees can be terminated.']);
        }

        $employee->update([
            'status'   => 'terminated',
            'end_date' => now()->toDateString(),
        ]);

        return redirect()->route('hr.employees.show', $employee)
            ->with('success', 'Employee terminated.');
    }
}

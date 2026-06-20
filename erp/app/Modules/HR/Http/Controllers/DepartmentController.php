<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Http\Requests\StoreDepartmentRequest;
use App\Modules\HR\Http\Resources\DepartmentResource;
use App\Modules\HR\Models\Department;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Department::class);

        $departments = Department::withCount('employees')
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/Departments/Index', [
            'departments' => DepartmentResource::collection($departments),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Departments', 'href' => route('hr.departments.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Department::class);

        return Inertia::render('HR/Departments/Create', [
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Departments', 'href' => route('hr.departments.index')],
                ['label' => 'New Department'],
            ],
        ]);
    }

    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        $this->authorize('create', Department::class);

        $department = Department::create([
            ...$request->validated(),
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->route('hr.departments.show', $department)
            ->with('success', 'Department created.');
    }

    public function show(Department $department): Response
    {
        $this->authorize('view', $department);

        $department->loadCount('employees');

        return Inertia::render('HR/Departments/Show', [
            'department'  => new DepartmentResource($department),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Departments', 'href' => route('hr.departments.index')],
                ['label' => $department->name],
            ],
        ]);
    }

    public function edit(Department $department): Response
    {
        $this->authorize('update', $department);

        return Inertia::render('HR/Departments/Edit', [
            'department'  => new DepartmentResource($department),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Departments', 'href' => route('hr.departments.index')],
                ['label' => $department->name, 'href' => route('hr.departments.show', $department)],
                ['label' => 'Edit'],
            ],
        ]);
    }

    public function update(StoreDepartmentRequest $request, Department $department): RedirectResponse
    {
        $this->authorize('update', $department);

        $department->update($request->validated());

        return redirect()->route('hr.departments.show', $department)
            ->with('success', 'Department updated.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $this->authorize('delete', $department);

        $department->delete();

        return redirect()->route('hr.departments.index')
            ->with('success', 'Department deleted.');
    }
}

<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\EmployeePositionChange;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeePositionChangeController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeePositionChange::class);

        $changes = EmployeePositionChange::with(['employee', 'fromDepartment', 'toDepartment'])
            ->when($request->employee_id, fn ($q) => $q->where('employee_id', $request->employee_id))
            ->orderBy('effective_date', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/PositionChanges/Index', [
            'changes' => $changes,
            'filters' => $request->only(['employee_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeePositionChange::class);

        $validated = $request->validate([
            'employee_id'        => 'required|exists:employees,id',
            'change_type'        => 'required|string|in:promotion,demotion,transfer,salary_change,title_change,department_change',
            'effective_date'     => 'required|date',
            'from_title'         => 'nullable|string|max:255',
            'to_title'           => 'nullable|string|max:255',
            'from_department_id' => 'nullable|exists:departments,id',
            'to_department_id'   => 'nullable|exists:departments,id',
            'from_salary'        => 'nullable|numeric|min:0',
            'to_salary'          => 'nullable|numeric|min:0',
            'reason'             => 'nullable|string',
            'notes'              => 'nullable|string',
        ]);

        $change = EmployeePositionChange::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$validated,
        ]);

        return redirect()->route('hr.position-changes.show', $change);
    }

    public function show(EmployeePositionChange $positionChange): Response
    {
        $this->authorize('view', $positionChange);

        $positionChange->load(['employee', 'fromDepartment', 'toDepartment', 'approvedBy']);

        return Inertia::render('HR/PositionChanges/Show', [
            'change' => $positionChange,
        ]);
    }

    public function approve(EmployeePositionChange $positionChange): RedirectResponse
    {
        $this->authorize('update', $positionChange);

        $positionChange->approve(auth()->id());

        return redirect()->back()->with('success', 'Position change approved successfully.');
    }

    public function destroy(EmployeePositionChange $positionChange): RedirectResponse
    {
        $this->authorize('delete', $positionChange);

        $positionChange->delete();

        return redirect()->route('hr.position-changes.index');
    }
}

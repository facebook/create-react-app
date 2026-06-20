<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\ShiftAssignment;
use App\Modules\HR\Models\ShiftTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftAssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ShiftAssignment::class);

        $query = ShiftAssignment::with(['shiftTemplate', 'employee'])
            ->orderBy('assigned_date', 'desc');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('date_from')) {
            $query->where('assigned_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('assigned_date', '<=', $request->date_to);
        }

        $assignments = $query->paginate(20)->withQueryString();

        $filters = $request->only(['employee_id', 'date_from', 'date_to']);

        return Inertia::render('HR/ShiftAssignments/Index', compact('assignments', 'filters'));
    }

    public function create(): Response
    {
        $this->authorize('create', ShiftAssignment::class);

        $shiftTemplates = ShiftTemplate::where('is_active', true)->orderBy('name')->get();
        $employees      = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/ShiftAssignments/Create', compact('shiftTemplates', 'employees'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ShiftAssignment::class);

        $data = $request->validate([
            'shift_template_id' => ['required', 'exists:shift_templates,id'],
            'employee_id'       => ['required', 'exists:employees,id'],
            'assigned_date'     => ['required', 'date'],
            'notes'             => ['nullable', 'string'],
        ]);

        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['status']    = 'scheduled';

        ShiftAssignment::create($data);

        return redirect()->route('hr.shift-assignments.index')->with('success', 'Shift assignment created.');
    }

    public function destroy(ShiftAssignment $shiftAssignment): RedirectResponse
    {
        $this->authorize('delete', $shiftAssignment);

        $shiftAssignment->delete();

        return redirect()->back()->with('success', 'Shift assignment deleted.');
    }

    public function markStatus(Request $request, ShiftAssignment $shiftAssignment): RedirectResponse
    {
        $this->authorize('update', $shiftAssignment);

        $data = $request->validate([
            'status' => ['required', 'in:scheduled,completed,absent,swapped'],
        ]);

        $shiftAssignment->update($data);

        return redirect()->back()->with('success', 'Status updated.');
    }
}

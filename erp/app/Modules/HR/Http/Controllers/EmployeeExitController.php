<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeExit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeExitController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeeExit::class);

        $exits = EmployeeExit::with('employee')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/EmployeeExits/Index', [
            'exits'   => $exits,
            'filters' => $request->only(['status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeExit::class);

        $validated = $request->validate([
            'employee_id'          => 'required|exists:employees,id',
            'exit_date'            => 'required|date',
            'exit_type'            => 'required|string|in:resignation,termination,retirement,redundancy,contract_end',
            'reason'               => 'nullable|string',
            'exit_interview_notes' => 'nullable|string',
            'equipment_returned'   => 'boolean',
            'access_revoked'       => 'boolean',
        ]);

        $exit = EmployeeExit::create([
            'tenant_id'            => auth()->user()->tenant_id,
            'employee_id'          => $validated['employee_id'],
            'exit_date'            => $validated['exit_date'],
            'exit_type'            => $validated['exit_type'],
            'reason'               => $validated['reason'] ?? null,
            'exit_interview_notes' => $validated['exit_interview_notes'] ?? null,
            'equipment_returned'   => $validated['equipment_returned'] ?? false,
            'access_revoked'       => $validated['access_revoked'] ?? false,
            'status'               => 'pending',
        ]);

        // Update employee status to terminated
        Employee::where('id', $validated['employee_id'])->update(['status' => 'terminated']);

        return redirect()->route('hr.employee-exits.show', $exit);
    }

    public function show(EmployeeExit $employeeExit): Response
    {
        $this->authorize('view', $employeeExit);

        $employeeExit->load(['employee', 'processedBy']);

        return Inertia::render('HR/EmployeeExits/Show', [
            'exit' => $employeeExit,
        ]);
    }

    public function complete(EmployeeExit $employeeExit): RedirectResponse
    {
        $this->authorize('update', $employeeExit);

        $employeeExit->complete(auth()->id());

        return redirect()->back()->with('success', 'Exit record marked as completed.');
    }

    public function markInProgress(EmployeeExit $employeeExit): RedirectResponse
    {
        $this->authorize('update', $employeeExit);

        $employeeExit->markInProgress();

        return redirect()->back()->with('success', 'Exit record marked as in progress.');
    }

    public function destroy(EmployeeExit $employeeExit): RedirectResponse
    {
        $this->authorize('delete', $employeeExit);

        $employeeExit->delete();

        return redirect()->route('hr.employee-exits.index');
    }
}

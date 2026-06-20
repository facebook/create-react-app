<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\EmployeeSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EmployeeSchedule::class);

        $assignments = EmployeeSchedule::with(['employee', 'schedule'])
            ->when($request->employee_id, fn ($q) => $q->where('employee_id', $request->employee_id))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/EmployeeSchedules/Index', [
            'assignments' => $assignments,
            'filters'     => $request->only(['employee_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmployeeSchedule::class);

        $validated = $request->validate([
            'employee_id'      => 'required|exists:employees,id',
            'work_schedule_id' => 'required|exists:work_schedules,id',
            'effective_from'   => 'required|date',
            'effective_to'     => 'nullable|date',
            'is_active'        => 'nullable|boolean',
        ]);

        EmployeeSchedule::create([
            'tenant_id'        => auth()->user()->tenant_id,
            'employee_id'      => $validated['employee_id'],
            'work_schedule_id' => $validated['work_schedule_id'],
            'effective_from'   => $validated['effective_from'],
            'effective_to'     => $validated['effective_to'] ?? null,
            'is_active'        => $validated['is_active'] ?? true,
        ]);

        return redirect()->back();
    }

    public function destroy(EmployeeSchedule $employeeSchedule): RedirectResponse
    {
        $this->authorize('delete', $employeeSchedule);

        $employeeSchedule->delete();

        return redirect()->back();
    }
}

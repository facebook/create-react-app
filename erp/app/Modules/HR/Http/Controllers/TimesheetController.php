<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\Timesheet;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimesheetController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Timesheet::class);

        $timesheets = Timesheet::with(['employee'])
            ->when($request->employee_id, fn ($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('week_start', 'desc')
            ->paginate(20)
            ->withQueryString();

        $employees = Employee::where('status', 'active')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/Timesheets/Index', [
            'timesheets' => $timesheets,
            'employees'  => $employees,
            'filters'    => $request->only(['employee_id', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Timesheet::class);

        $employees = Employee::where('status', 'active')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/Timesheets/Create', [
            'employees' => $employees,
        ]);
    }

        public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Timesheet::class);

        $validated = $request->validate([
            'week_start'  => 'required|date',
            'employee_id' => 'required|exists:employees,id',
            'notes'       => 'nullable|string',
        ]);

        $weekEnd = Carbon::parse($validated['week_start'])->endOfWeek(Carbon::SUNDAY)->toDateString();

        Timesheet::create([
            'tenant_id'   => auth()->user()->tenant_id,
            'employee_id' => $validated['employee_id'],
            'week_start'  => $validated['week_start'],
            'week_end'    => $weekEnd,
            'notes'       => $validated['notes'] ?? null,
            'status'      => 'draft',
            'total_hours' => 0,
        ]);

        return redirect()->back();
    }

    public function show(Timesheet $timesheet): Response
    {
        $this->authorize('view', $timesheet);

        $timesheet->load(['employee', 'entries', 'approvedBy']);

        return Inertia::render('HR/Timesheets/Show', [
            'timesheet' => $timesheet,
        ]);
    }

    public function submit(Timesheet $timesheet): RedirectResponse
    {
        $this->authorize('update', $timesheet);

        $timesheet->submit();

        return redirect()->back();
    }

    public function approve(Timesheet $timesheet): RedirectResponse
    {
        $this->authorize('update', $timesheet);

        $timesheet->approve(auth()->id());

        return redirect()->back();
    }

    public function reject(Timesheet $timesheet): RedirectResponse
    {
        $this->authorize('update', $timesheet);

        $timesheet->reject();

        return redirect()->back();
    }

    public function addEntry(Request $request, Timesheet $timesheet): RedirectResponse
    {
        $this->authorize('update', $timesheet);

        $validated = $request->validate([
            'work_date'   => 'required|date',
            'hours'       => 'required|numeric|min:0.25|max:24',
            'project'     => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $timesheet->entries()->create([
            'tenant_id'   => auth()->user()->tenant_id,
            'timesheet_id' => $timesheet->id,
            'work_date'   => $validated['work_date'],
            'hours'       => $validated['hours'],
            'project'     => $validated['project'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        $timesheet->recalculateHours();

        return redirect()->back();
    }

    public function destroy(Timesheet $timesheet): RedirectResponse
    {
        $this->authorize('delete', $timesheet);

        $timesheet->delete();

        return redirect()->route('hr.timesheets.index');
    }

}
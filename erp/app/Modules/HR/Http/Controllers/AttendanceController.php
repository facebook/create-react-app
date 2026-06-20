<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\AttendanceRecord;
use App\Modules\HR\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AttendanceRecord::class);

        $query = AttendanceRecord::with('employee');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('month')) {
            [$year, $month] = explode('-', $request->month);
            $query->whereYear('work_date', $year)->whereMonth('work_date', $month);
        }

        $records   = $query->orderByDesc('work_date')->paginate(20)->withQueryString();
        $employees = Employee::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/Attendance/Index', compact('records', 'employees'));
    }

    public function create(): Response
    {
        $this->authorize('create', AttendanceRecord::class);

        $employees = Employee::where('status', 'active')->orderBy('first_name')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/Attendance/Create', compact('employees'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', AttendanceRecord::class);

        $data = $request->validate([
            'employee_id'   => ['required', Rule::exists('employees', 'id')],
            'work_date'     => [
                'required',
                'date',
                function ($attribute, $value, $fail) use ($request) {
                    $exists = \Illuminate\Support\Facades\DB::table('attendance_records')
                        ->whereNull('deleted_at')
                        ->where('employee_id', $request->input('employee_id'))
                        ->whereDate('work_date', $value)
                        ->exists();
                    if ($exists) {
                        $fail('The employee already has an attendance record for this date.');
                    }
                },
            ],
            'clock_in'      => ['nullable', 'date_format:H:i'],
            'clock_out'     => ['nullable', 'date_format:H:i', 'after:clock_in'],
            'break_minutes' => ['nullable', 'integer', 'min:0'],
            'status'        => ['required', Rule::in(['present', 'absent', 'half_day', 'holiday', 'leave'])],
            'notes'         => ['nullable', 'string'],
        ]);

        AttendanceRecord::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$data,
        ]);

        return redirect()->route('hr.attendance.index')->with('success', 'Attendance record logged.');
    }

    public function show(AttendanceRecord $attendance): Response
    {
        $this->authorize('view', $attendance);

        $attendance->load('employee');

        return Inertia::render('HR/Attendance/Show', compact('attendance'));
    }

    public function update(Request $request, AttendanceRecord $attendance): RedirectResponse
    {
        $this->authorize('update', $attendance);

        $data = $request->validate([
            'clock_in'      => ['nullable', 'date_format:H:i'],
            'clock_out'     => ['nullable', 'date_format:H:i', 'after:clock_in'],
            'break_minutes' => ['nullable', 'integer', 'min:0'],
            'status'        => ['nullable', Rule::in(['present', 'absent', 'half_day', 'holiday', 'leave'])],
            'notes'         => ['nullable', 'string'],
        ]);

        $attendance->update($data);

        return back()->with('success', 'Attendance record updated.');
    }

    public function destroy(AttendanceRecord $attendance): RedirectResponse
    {
        $this->authorize('delete', $attendance);

        $attendance->delete();

        return redirect()->route('hr.attendance.index')->with('success', 'Attendance record deleted.');
    }
}

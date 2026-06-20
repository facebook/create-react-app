<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\WorkSchedule;
use App\Modules\HR\Models\WorkScheduleShift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', WorkSchedule::class);

        $schedules = WorkSchedule::query()
            ->when($request->has('is_active') && $request->is_active !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/WorkSchedules/Index', [
            'schedules' => $schedules,
            'filters'   => $request->only(['is_active']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', WorkSchedule::class);

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'timezone'      => 'nullable|string',
            'hours_per_week' => 'nullable|integer|min:1|max:168',
            'is_active'     => 'nullable|boolean',
            'description'   => 'nullable|string',
        ]);

        WorkSchedule::create([
            'tenant_id'      => auth()->user()->tenant_id,
            'name'           => $validated['name'],
            'timezone'       => $validated['timezone'] ?? 'UTC',
            'hours_per_week' => $validated['hours_per_week'] ?? 40,
            'is_active'      => $validated['is_active'] ?? true,
            'description'    => $validated['description'] ?? null,
        ]);

        return redirect()->back();
    }

    public function show(WorkSchedule $workSchedule): Response
    {
        $this->authorize('view', $workSchedule);

        $workSchedule->load(['shifts', 'assignments.employee']);

        return Inertia::render('HR/WorkSchedules/Show', [
            'workSchedule' => $workSchedule,
        ]);
    }

    public function addShift(Request $request, WorkSchedule $workSchedule): RedirectResponse
    {
        $this->authorize('update', $workSchedule);

        $validated = $request->validate([
            'day_of_week'   => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time'    => 'required|date_format:H:i',
            'end_time'      => 'required|date_format:H:i',
            'break_minutes' => 'nullable|numeric|min:0',
        ]);

        WorkScheduleShift::create([
            'tenant_id'        => auth()->user()->tenant_id,
            'work_schedule_id' => $workSchedule->id,
            'day_of_week'      => $validated['day_of_week'],
            'start_time'       => $validated['start_time'],
            'end_time'         => $validated['end_time'],
            'break_minutes'    => $validated['break_minutes'] ?? 0,
        ]);

        return redirect()->back();
    }

    public function destroy(WorkSchedule $workSchedule): RedirectResponse
    {
        $this->authorize('delete', $workSchedule);

        $workSchedule->delete();

        return redirect()->back();
    }
}

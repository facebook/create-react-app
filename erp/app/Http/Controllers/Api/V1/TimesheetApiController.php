<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\Timesheet;
use App\Modules\HR\Models\TimesheetEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimesheetApiController extends ApiController
{
    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }

    // ── Timesheets ────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $tenantId   = $this->tenantId($request);
        $timesheets = Timesheet::where('tenant_id', $tenantId)
            ->with('employee:id,first_name,last_name,employee_number')
            ->withCount('entries')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('employee_id'), fn ($q, $e) => $q->where('employee_id', $e))
            ->orderByDesc('week_start')
            ->get();

        return $this->success($timesheets);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'week_start'  => ['required', 'date'],
            'week_end'    => ['required', 'date', 'after_or_equal:week_start'],
            'notes'       => ['nullable', 'string'],
        ]);

        $timesheet = Timesheet::create([
            'tenant_id'  => $tenantId,
            'employee_id'=> $data['employee_id'],
            'week_start' => $data['week_start'],
            'week_end'   => $data['week_end'],
            'status'     => 'draft',
            'notes'      => $data['notes'] ?? null,
        ]);

        return $this->success($timesheet->load('employee:id,first_name,last_name'), 201);
    }

    public function show(Timesheet $timesheet): JsonResponse
    {
        $timesheet->load('employee:id,first_name,last_name,employee_number', 'entries', 'approvedBy:id,name');

        return $this->success($timesheet);
    }

    public function destroy(Timesheet $timesheet): JsonResponse
    {
        if ($timesheet->status === 'approved') {
            return $this->error('Approved timesheets cannot be deleted.', 422);
        }

        $timesheet->delete();

        return $this->success(['message' => 'Timesheet deleted.']);
    }

    // ── Entries ───────────────────────────────────────────────────────────────

    public function addEntry(Request $request, Timesheet $timesheet): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        if ($timesheet->status !== 'draft') {
            return $this->error('Entries can only be added to draft timesheets.', 422);
        }

        $data = $request->validate([
            'work_date'   => ['required', 'date'],
            'hours'       => ['required', 'numeric', 'min:0.5', 'max:24'],
            'project'     => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        $entry = TimesheetEntry::create([
            'tenant_id'    => $tenantId,
            'timesheet_id' => $timesheet->id,
            'work_date'    => $data['work_date'],
            'hours'        => $data['hours'],
            'project'      => $data['project'] ?? null,
            'description'  => $data['description'] ?? null,
        ]);

        $timesheet->recalculateHours();

        return $this->success($entry, 201);
    }

    public function removeEntry(Timesheet $timesheet, TimesheetEntry $entry): JsonResponse
    {
        if ($timesheet->status !== 'draft') {
            return $this->error('Entries can only be removed from draft timesheets.', 422);
        }

        $entry->delete();
        $timesheet->recalculateHours();

        return $this->success(['message' => 'Entry removed.', 'total_hours' => $timesheet->fresh()->total_hours]);
    }

    // ── Workflow ──────────────────────────────────────────────────────────────

    public function submit(Timesheet $timesheet): JsonResponse
    {
        if ($timesheet->status !== 'draft') {
            return $this->error('Only draft timesheets can be submitted.', 422);
        }

        $timesheet->submit();

        return $this->success($timesheet->fresh());
    }

    public function approve(Request $request, Timesheet $timesheet): JsonResponse
    {
        if ($timesheet->status !== 'submitted') {
            return $this->error('Only submitted timesheets can be approved.', 422);
        }

        $timesheet->approve($request->user()->id);

        return $this->success($timesheet->fresh()->load('approvedBy:id,name'));
    }

    public function reject(Timesheet $timesheet): JsonResponse
    {
        if ($timesheet->status !== 'submitted') {
            return $this->error('Only submitted timesheets can be rejected.', 422);
        }

        $timesheet->reject();

        return $this->success($timesheet->fresh());
    }

    // ── Summary ───────────────────────────────────────────────────────────────

    public function summary(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $counts = Timesheet::where('tenant_id', $tenantId)
            ->selectRaw('status, COUNT(*) as total, SUM(total_hours) as hours')
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->map(fn ($r) => ['count' => (int) $r->total, 'hours' => (float) $r->hours]);

        return $this->success([
            'by_status'   => $counts,
            'grand_total' => Timesheet::where('tenant_id', $tenantId)->sum('total_hours'),
        ]);
    }
}

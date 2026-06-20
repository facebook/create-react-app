<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\OvertimeRequest;
use App\Modules\HR\Models\ShiftAssignment;
use App\Modules\HR\Models\ShiftTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftOvertimeApiController extends ApiController
{
    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }

    // ── Shift Templates ───────────────────────────────────────────────────────

    public function indexTemplates(Request $request): JsonResponse
    {
        $tenantId  = $this->tenantId($request);
        $templates = ShiftTemplate::where('tenant_id', $tenantId)
            ->withCount('assignments')
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('name')
            ->get();

        return $this->success($templates);
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'          => ['required', 'string', 'max:100'],
            'start_time'    => ['required', 'date_format:H:i'],
            'end_time'      => ['required', 'date_format:H:i'],
            'break_minutes' => ['nullable', 'integer', 'min:0'],
            'days_of_week'  => ['nullable', 'array'],
            'color'         => ['nullable', 'string', 'max:20'],
        ]);

        $template = ShiftTemplate::create([
            'tenant_id'     => $tenantId,
            'name'          => $data['name'],
            'start_time'    => $data['start_time'],
            'end_time'      => $data['end_time'],
            'break_minutes' => $data['break_minutes'] ?? 0,
            'days_of_week'  => $data['days_of_week'] ?? null,
            'color'         => $data['color'] ?? '#6366f1',
            'is_active'     => true,
        ]);

        return $this->success($template, 201);
    }

    public function updateTemplate(Request $request, ShiftTemplate $shiftTemplate): JsonResponse
    {
        $data = $request->validate([
            'name'          => ['sometimes', 'string', 'max:100'],
            'start_time'    => ['sometimes', 'date_format:H:i'],
            'end_time'      => ['sometimes', 'date_format:H:i'],
            'break_minutes' => ['nullable', 'integer', 'min:0'],
            'days_of_week'  => ['nullable', 'array'],
            'color'         => ['nullable', 'string', 'max:20'],
            'is_active'     => ['boolean'],
        ]);

        $shiftTemplate->update($data);

        return $this->success($shiftTemplate->fresh());
    }

    public function destroyTemplate(ShiftTemplate $shiftTemplate): JsonResponse
    {
        $shiftTemplate->delete();

        return $this->success(['message' => 'Shift template deleted.']);
    }

    // ── Shift Assignments ─────────────────────────────────────────────────────

    public function indexAssignments(Request $request): JsonResponse
    {
        $tenantId   = $this->tenantId($request);
        $assignments = ShiftAssignment::where('tenant_id', $tenantId)
            ->with('employee:id,first_name,last_name', 'shiftTemplate:id,name,start_time,end_time')
            ->when($request->input('employee_id'), fn ($q, $e) => $q->where('employee_id', $e))
            ->when($request->input('from'), fn ($q, $d) => $q->whereDate('assigned_date', '>=', $d))
            ->when($request->input('to'), fn ($q, $d) => $q->whereDate('assigned_date', '<=', $d))
            ->orderBy('assigned_date')
            ->get();

        return $this->success($assignments);
    }

    public function storeAssignment(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'shift_template_id' => ['required', 'integer', 'exists:shift_templates,id'],
            'employee_id'       => ['required', 'integer', 'exists:employees,id'],
            'assigned_date'     => ['required', 'date'],
            'notes'             => ['nullable', 'string'],
        ]);

        $assignment = ShiftAssignment::create([
            'tenant_id'         => $tenantId,
            'shift_template_id' => $data['shift_template_id'],
            'employee_id'       => $data['employee_id'],
            'assigned_date'     => $data['assigned_date'],
            'notes'             => $data['notes'] ?? null,
            'status'            => 'scheduled',
        ]);

        return $this->success($assignment->load('employee:id,first_name,last_name', 'shiftTemplate:id,name,start_time,end_time'), 201);
    }

    public function destroyAssignment(ShiftAssignment $shiftAssignment): JsonResponse
    {
        $shiftAssignment->delete();

        return $this->success(['message' => 'Shift assignment removed.']);
    }

    // ── Overtime Requests ─────────────────────────────────────────────────────

    public function indexOvertime(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $requests = OvertimeRequest::where('tenant_id', $tenantId)
            ->with('employee:id,first_name,last_name')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('employee_id'), fn ($q, $e) => $q->where('employee_id', $e))
            ->orderByDesc('work_date')
            ->get()
            ->map(fn ($r) => array_merge($r->toArray(), ['total_pay' => $r->total_pay]));

        return $this->success($requests);
    }

    public function storeOvertime(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'employee_id'     => ['required', 'integer', 'exists:employees,id'],
            'work_date'       => ['required', 'date'],
            'hours'           => ['required', 'numeric', 'min:0.5', 'max:12'],
            'rate_multiplier' => ['nullable', 'numeric', 'min:1'],
            'reason'          => ['nullable', 'string'],
        ]);

        $overtime = OvertimeRequest::create([
            'tenant_id'       => $tenantId,
            'employee_id'     => $data['employee_id'],
            'work_date'       => $data['work_date'],
            'hours'           => $data['hours'],
            'rate_multiplier' => $data['rate_multiplier'] ?? 1.5,
            'reason'          => $data['reason'] ?? null,
            'status'          => 'pending',
        ]);

        return $this->success($overtime->load('employee:id,first_name,last_name'), 201);
    }

    public function approveOvertime(Request $request, OvertimeRequest $overtimeRequest): JsonResponse
    {
        if ($overtimeRequest->status !== 'pending') {
            return $this->error('Only pending overtime requests can be approved.', 422);
        }

        $overtimeRequest->approve($request->user()->id);

        return $this->success(array_merge($overtimeRequest->fresh()->toArray(), [
            'total_pay' => $overtimeRequest->fresh()->total_pay,
        ]));
    }

    public function rejectOvertime(Request $request, OvertimeRequest $overtimeRequest): JsonResponse
    {
        if ($overtimeRequest->status !== 'pending') {
            return $this->error('Only pending overtime requests can be rejected.', 422);
        }

        $data = $request->validate([
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $overtimeRequest->reject($data['rejection_reason'] ?? '');

        return $this->success($overtimeRequest->fresh());
    }

    public function cancelOvertime(OvertimeRequest $overtimeRequest): JsonResponse
    {
        if ($overtimeRequest->status === 'approved') {
            return $this->error('Approved overtime requests cannot be cancelled.', 422);
        }

        $overtimeRequest->cancel();

        return $this->success($overtimeRequest->fresh());
    }
}

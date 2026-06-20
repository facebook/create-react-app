<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveBalance;
use App\Modules\HR\Models\LeaveType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveBalanceController extends ApiController
{
    public function types(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $types    = LeaveType::where('tenant_id', $tenantId)->where('is_active', true)->get();
        return $this->success($types);
    }

    public function employee(Request $request, Employee $employee): JsonResponse
    {
        $year     = (int) $request->get('year', now()->year);
        $balances = LeaveBalance::where('employee_id', $employee->id)
            ->where('year', $year)
            ->with('leaveType')
            ->get()
            ->map(fn ($b) => [
                'leave_type_id'  => $b->leave_type_id,
                'leave_type'     => $b->leaveType?->name,
                'year'           => $b->year,
                'allocated_days' => $b->allocated_days,
                'used_days'      => $b->used_days,
                'pending_days'   => $b->pending_days,
                'remaining_days' => $b->remaining_days,
            ]);

        return $this->success([
            'employee_id'   => $employee->id,
            'employee_name' => $employee->full_name,
            'year'          => $year,
            'balances'      => $balances,
        ]);
    }

    public function allocate(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'employee_id'    => ['required', 'exists:employees,id'],
            'leave_type_id'  => ['required', 'exists:leave_types,id'],
            'year'           => ['required', 'integer', 'min:2000'],
            'allocated_days' => ['required', 'numeric', 'min:0'],
        ]);

        $balance = LeaveBalance::updateOrCreate(
            [
                'employee_id'   => $data['employee_id'],
                'leave_type_id' => $data['leave_type_id'],
                'year'          => $data['year'],
            ],
            [
                'tenant_id'      => $tenantId,
                'allocated_days' => $data['allocated_days'],
            ]
        );

        return $this->success($balance->load('leaveType'), 201);
    }

    public function team(Request $request): JsonResponse
    {
        $tenantId    = $this->tenantId($request);
        $year        = (int) $request->get('year', now()->year);
        $departmentId = $request->get('department_id');

        $employees = Employee::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->when($departmentId, fn ($q) => $q->where('department_id', $departmentId))
            ->with(['leaveBalances' => fn ($q) => $q->where('year', $year)->with('leaveType')])
            ->get()
            ->map(fn ($e) => [
                'employee_id'   => $e->id,
                'employee_name' => $e->full_name,
                'balances'      => $e->leaveBalances->map(fn ($b) => [
                    'leave_type'     => $b->leaveType?->name,
                    'allocated_days' => $b->allocated_days,
                    'used_days'      => $b->used_days,
                    'remaining_days' => $b->remaining_days,
                ]),
                'total_remaining' => $e->leaveBalances->sum('remaining_days'),
            ]);

        return $this->success([
            'year'      => $year,
            'employees' => $employees,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

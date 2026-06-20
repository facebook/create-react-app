<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\ExpenseClaim;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\Payslip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SelfServiceController extends ApiController
{
    public function profile(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        return $this->success($employee->load(['department:id,name', 'leaveBalances.leaveType:id,name']));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        $data = $request->validate([
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $employee->update($data);

        return $this->success($employee->fresh());
    }

    public function payslips(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        $payslips = Payslip::where('employee_id', $employee->id)
            ->with('payrollRun:id,period_start,period_end,status')
            ->orderByDesc('created_at')
            ->paginate(12);

        return $this->paginated($payslips);
    }

    public function leaveRequests(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        $requests = LeaveRequest::where('employee_id', $employee->id)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->with('leaveType:id,name')
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->paginated($requests);
    }

    public function applyLeave(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        $data = $request->validate([
            'leave_type_id' => ['required', 'integer', 'exists:leave_types,id'],
            'start_date'    => ['required', 'date', 'after_or_equal:today'],
            'end_date'      => ['required', 'date', 'after_or_equal:start_date'],
            'reason'        => ['nullable', 'string', 'max:500'],
        ]);

        $days = (int) now()->parse($data['start_date'])->diffInWeekdays(now()->parse($data['end_date'])) + 1;

        $leaveRequest = LeaveRequest::create([
            'tenant_id'      => $employee->tenant_id,
            'employee_id'    => $employee->id,
            'leave_type_id'  => $data['leave_type_id'],
            'start_date'     => $data['start_date'],
            'end_date'       => $data['end_date'],
            'days'           => $days,
            'days_requested' => $days,
            'reason'         => $data['reason'] ?? null,
            'notes'          => $data['reason'] ?? null,
            'status'         => 'pending',
        ]);

        return $this->success($leaveRequest->load('leaveType:id,name'), 201);
    }

    public function expenseClaims(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        $claims = ExpenseClaim::where('employee_id', $employee->id)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->with('items')
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->paginated($claims);
    }

    public function summary(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        $pendingLeave   = LeaveRequest::where('employee_id', $employee->id)->where('status', 'pending')->count();
        $pendingExpense = ExpenseClaim::where('employee_id', $employee->id)->where('status', 'submitted')->count();
        $totalPayslips  = Payslip::where('employee_id', $employee->id)->count();

        return $this->success([
            'employee_id'           => $employee->id,
            'name'                  => $employee->full_name,
            'position'              => $employee->position,
            'department'            => $employee->department?->name,
            'pending_leave_requests' => $pendingLeave,
            'pending_expense_claims' => $pendingExpense,
            'total_payslips'         => $totalPayslips,
        ]);
    }

    private function resolveEmployee(Request $request): ?Employee
    {
        return Employee::where('user_id', $request->user()->id)->first();
    }
}

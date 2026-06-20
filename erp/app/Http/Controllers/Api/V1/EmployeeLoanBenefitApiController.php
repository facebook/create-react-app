<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\HR\Models\BenefitPlan;
use App\Modules\HR\Models\EmployeeBenefit;
use App\Modules\HR\Models\EmployeeLoan;
use App\Modules\HR\Models\LoanRepayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeLoanBenefitApiController extends ApiController
{
    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }

    // ── Employee Loans ────────────────────────────────────────────────────────

    public function indexLoans(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $loans    = EmployeeLoan::where('tenant_id', $tenantId)
            ->with('employee:id,first_name,last_name')
            ->withCount('repayments')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('employee_id'), fn ($q, $e) => $q->where('employee_id', $e))
            ->orderByDesc('created_at')
            ->get();

        return $this->success($loans);
    }

    public function storeLoan(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'employee_id'          => ['required', 'integer', 'exists:employees,id'],
            'type'                 => ['required', 'in:loan,advance'],
            'amount'               => ['required', 'numeric', 'min:1'],
            'interest_rate'        => ['nullable', 'numeric', 'min:0'],
            'purpose'              => ['nullable', 'string', 'max:200'],
            'repayment_start_date' => ['nullable', 'date'],
            'notes'                => ['nullable', 'string'],
        ]);

        $loan = EmployeeLoan::create([
            'tenant_id'            => $tenantId,
            'employee_id'          => $data['employee_id'],
            'type'                 => $data['type'],
            'amount'               => $data['amount'],
            'outstanding_balance'  => $data['amount'],
            'interest_rate'        => $data['interest_rate'] ?? 0,
            'status'               => 'pending',
            'purpose'              => $data['purpose'] ?? null,
            'repayment_start_date' => $data['repayment_start_date'] ?? null,
            'notes'                => $data['notes'] ?? null,
        ]);

        return $this->success($loan->load('employee:id,first_name,last_name'), 201);
    }

    public function showLoan(EmployeeLoan $employeeLoan): JsonResponse
    {
        $employeeLoan->load('employee:id,first_name,last_name', 'repayments', 'approver:id,name');

        return $this->success($employeeLoan);
    }

    public function approveLoan(Request $request, EmployeeLoan $employeeLoan): JsonResponse
    {
        if ($employeeLoan->status !== 'pending') {
            return $this->error('Only pending loans can be approved.', 422);
        }

        $employeeLoan->approve($request->user());

        return $this->success($employeeLoan->fresh()->load('approver:id,name'));
    }

    public function cancelLoan(EmployeeLoan $employeeLoan): JsonResponse
    {
        if (!in_array($employeeLoan->status, ['pending'])) {
            return $this->error('Only pending loans can be cancelled.', 422);
        }

        $employeeLoan->cancel();

        return $this->success($employeeLoan->fresh());
    }

    public function recordRepayment(Request $request, EmployeeLoan $employeeLoan): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        if ($employeeLoan->status !== 'active') {
            return $this->error('Repayments can only be recorded for active loans.', 422);
        }

        $data = $request->validate([
            'amount'       => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'notes'        => ['nullable', 'string'],
        ]);

        $repayment = LoanRepayment::create([
            'tenant_id'       => $tenantId,
            'employee_loan_id'=> $employeeLoan->id,
            'amount'          => $data['amount'],
            'payment_date'    => $data['payment_date'],
            'notes'           => $data['notes'] ?? null,
        ]);

        $newBalance = max(0, (float) $employeeLoan->outstanding_balance - (float) $data['amount']);
        $employeeLoan->outstanding_balance = $newBalance;
        if ($newBalance <= 0) {
            $employeeLoan->status = 'completed';
        }
        $employeeLoan->save();

        return $this->success([
            'repayment'           => $repayment,
            'outstanding_balance' => $employeeLoan->fresh()->outstanding_balance,
            'status'              => $employeeLoan->fresh()->status,
        ]);
    }

    // ── Benefit Plans ─────────────────────────────────────────────────────────

    public function indexBenefitPlans(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $plans    = BenefitPlan::where('tenant_id', $tenantId)
            ->withCount('enrollments')
            ->when($request->input('type'), fn ($q, $t) => $q->where('type', $t))
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => array_merge($p->toArray(), ['total_cost' => $p->total_cost]));

        return $this->success($plans);
    }

    public function storeBenefitPlan(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'          => ['required', 'string', 'max:100'],
            'type'          => ['required', 'in:health,dental,vision,life,retirement,other'],
            'description'   => ['nullable', 'string'],
            'employee_cost' => ['nullable', 'numeric', 'min:0'],
            'employer_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $plan = BenefitPlan::create([
            'tenant_id'     => $tenantId,
            'name'          => $data['name'],
            'type'          => $data['type'],
            'description'   => $data['description'] ?? null,
            'employee_cost' => $data['employee_cost'] ?? 0,
            'employer_cost' => $data['employer_cost'] ?? 0,
            'is_active'     => true,
        ]);

        return $this->success($plan, 201);
    }

    public function enrollEmployee(Request $request, BenefitPlan $benefitPlan): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'enrolled_at' => ['nullable', 'date'],
            'notes'       => ['nullable', 'string'],
        ]);

        $enrollment = EmployeeBenefit::create([
            'tenant_id'       => $tenantId,
            'benefit_plan_id' => $benefitPlan->id,
            'employee_id'     => $data['employee_id'],
            'enrolled_at'     => $data['enrolled_at'] ?? now()->toDateString(),
            'status'          => 'active',
            'notes'           => $data['notes'] ?? null,
        ]);

        return $this->success($enrollment->load('employee:id,first_name,last_name', 'plan:id,name,type'), 201);
    }

    public function endEnrollment(BenefitPlan $benefitPlan, EmployeeBenefit $employeeBenefit): JsonResponse
    {
        $employeeBenefit->end();

        return $this->success($employeeBenefit->fresh());
    }
}

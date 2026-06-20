<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Budget;
use App\Modules\Finance\Models\BudgetLine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $budgets = Budget::where('tenant_id', $tenantId)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->year, fn ($q) => $q->where('fiscal_year', $request->year))
            ->withCount('lines')
            ->orderByDesc('fiscal_year')
            ->paginate(20);

        return $this->paginated($budgets);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'fiscal_year'  => ['required', 'integer', 'min:2000'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'department'   => ['nullable', 'string', 'max:255'],
            'notes'        => ['nullable', 'string'],
            'start_date'   => ['nullable', 'date'],
            'end_date'     => ['nullable', 'date'],
        ]);

        $budget = Budget::create([
            ...$data,
            'tenant_id'   => $tenantId,
            'created_by'  => $request->user()->id,
            'year'        => $data['fiscal_year'],
            'status'      => 'draft',
            'budget_type' => 'annual',
            'period_type' => 'annual',
        ]);

        return $this->success($budget, 201);
    }

    public function show(Request $request, Budget $budget): JsonResponse
    {
        return $this->success($budget->load('lines'));
    }

    public function activate(Request $request, Budget $budget): JsonResponse
    {
        $budget->activate($request->user()->id);
        return $this->success($budget->fresh());
    }

    public function close(Budget $budget): JsonResponse
    {
        $budget->close();
        return $this->success($budget->fresh());
    }

    public function destroy(Budget $budget): JsonResponse
    {
        $budget->delete();
        return $this->success(['message' => 'Budget deleted.']);
    }

    public function variance(Request $request, Budget $budget): JsonResponse
    {
        $budget->recalculate();

        return $this->success([
            'budget'              => $budget->fresh(),
            'total_budgeted'      => $budget->total_amount,
            'total_actual'        => $budget->spent_amount,
            'variance'            => $budget->remaining_amount,
            'utilization_percent' => $budget->utilization_percent,
            'is_exceeded'         => $budget->is_exceeded,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

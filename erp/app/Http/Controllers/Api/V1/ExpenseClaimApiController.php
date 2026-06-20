<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\HR\Models\ExpenseClaim;
use App\Modules\HR\Models\ExpenseClaimItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseClaimApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $claims = ExpenseClaim::where('tenant_id', $tenantId)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->employee_id, fn ($q) => $q->where('employee_id', $request->employee_id))
            ->with(['employee:id,first_name,last_name'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->paginated($claims);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'notes'       => ['nullable', 'string'],
            'items'       => ['required', 'array', 'min:1'],
            'items.*.category'     => ['required', 'string', 'max:50'],
            'items.*.description'  => ['required', 'string'],
            'items.*.amount'       => ['required', 'numeric', 'min:0.01'],
            'items.*.expense_date' => ['required', 'date'],
        ]);

        $claim = ExpenseClaim::create([
            'tenant_id'   => $tenantId,
            'employee_id' => $data['employee_id'],
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'notes'       => $data['notes'] ?? null,
            'status'      => 'draft',
            'total_amount' => 0,
        ]);

        foreach ($data['items'] as $item) {
            ExpenseClaimItem::create([
                'tenant_id'       => $tenantId,
                'expense_claim_id' => $claim->id,
                ...$item,
            ]);
        }

        $claim->recalculateTotal();

        return $this->success($claim->load('items'), 201);
    }

    public function show(ExpenseClaim $expenseClaim): JsonResponse
    {
        return $this->success($expenseClaim->load(['items', 'employee:id,first_name,last_name', 'approvedBy:id,name']));
    }

    public function submit(ExpenseClaim $expenseClaim): JsonResponse
    {
        $expenseClaim->submit();
        return $this->success($expenseClaim->fresh());
    }

    public function approve(Request $request, ExpenseClaim $expenseClaim): JsonResponse
    {
        $expenseClaim->approve($request->user());
        return $this->success($expenseClaim->fresh());
    }

    public function reject(Request $request, ExpenseClaim $expenseClaim): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $expenseClaim->reject($data['reason']);
        return $this->success($expenseClaim->fresh());
    }

    public function markPaid(ExpenseClaim $expenseClaim): JsonResponse
    {
        $expenseClaim->markPaid();
        return $this->success($expenseClaim->fresh());
    }

    public function destroy(ExpenseClaim $expenseClaim): JsonResponse
    {
        $expenseClaim->delete();
        return $this->success(['message' => 'Expense claim deleted.']);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

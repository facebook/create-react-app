<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Commission;
use App\Modules\Finance\Models\CommissionRule;
use App\Modules\Finance\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionApiController extends ApiController
{
    // ── Commission Rules ──────────────────────────────────────────────────────

    public function indexRules(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $rules = CommissionRule::where('tenant_id', $tenantId)
            ->with('user:id,name')
            ->get();

        return $this->success($rules);
    }

    public function storeRule(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'user_id'      => ['required', 'integer', 'exists:users,id'],
            'name'         => ['required', 'string', 'max:100'],
            'type'         => ['required', 'string', 'in:percentage,fixed'],
            'rate'         => ['required_if:type,percentage', 'nullable', 'numeric', 'min:0', 'max:1'],
            'fixed_amount' => ['required_if:type,fixed', 'nullable', 'numeric', 'min:0'],
        ]);

        $rule = CommissionRule::create([...$data, 'tenant_id' => $tenantId, 'is_active' => true]);

        return $this->success($rule->load('user:id,name'), 201);
    }

    public function updateRule(Request $request, CommissionRule $commissionRule): JsonResponse
    {
        $data = $request->validate([
            'name'         => ['sometimes', 'string', 'max:100'],
            'rate'         => ['nullable', 'numeric', 'min:0', 'max:1'],
            'fixed_amount' => ['nullable', 'numeric', 'min:0'],
            'is_active'    => ['boolean'],
        ]);

        $commissionRule->update($data);

        return $this->success($commissionRule->fresh()->load('user:id,name'));
    }

    // ── Commissions ───────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $commissions = Commission::where('tenant_id', $tenantId)
            ->when($request->user_id, fn ($q) => $q->where('user_id', $request->user_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->with(['user:id,name', 'invoice:id,contact_id', 'rule:id,name'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->paginated($commissions);
    }

    public function calculate(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'invoice_id'        => ['required', 'integer', 'exists:invoices,id'],
            'commission_rule_id' => ['required', 'integer', 'exists:commission_rules,id'],
        ]);

        $invoice = Invoice::where('tenant_id', $tenantId)->findOrFail($data['invoice_id']);
        $rule    = CommissionRule::where('tenant_id', $tenantId)->findOrFail($data['commission_rule_id']);

        $invoiceAmount    = $invoice->total ?? 0;
        $commissionAmount = $rule->calculateCommission((float) $invoiceAmount);

        $commission = Commission::create([
            'tenant_id'          => $tenantId,
            'commission_rule_id' => $rule->id,
            'user_id'            => $rule->user_id,
            'invoice_id'         => $invoice->id,
            'invoice_amount'     => $invoiceAmount,
            'commission_amount'  => $commissionAmount,
            'status'             => 'pending',
        ]);

        return $this->success($commission->load(['user:id,name', 'rule:id,name']), 201);
    }

    public function approve(Commission $commission): JsonResponse
    {
        $commission->approve();
        return $this->success($commission->fresh());
    }

    public function markPaid(Commission $commission): JsonResponse
    {
        $commission->markPaid();
        return $this->success($commission->fresh());
    }

    public function summary(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $from     = $request->get('from', now()->startOfMonth()->toDateString());
        $to       = $request->get('to', now()->toDateString());

        $commissions = Commission::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->with('user:id,name')
            ->get();

        $byUser = $commissions->groupBy('user_id')->map(fn ($group) => [
            'user_id'             => $group->first()->user_id,
            'name'                => $group->first()->user?->name,
            'total_commissions'   => $group->count(),
            'pending_amount'      => (float) $group->where('status', 'pending')->sum('commission_amount'),
            'approved_amount'     => (float) $group->where('status', 'approved')->sum('commission_amount'),
            'paid_amount'         => (float) $group->where('status', 'paid')->sum('commission_amount'),
            'total_amount'        => (float) $group->sum('commission_amount'),
        ])->sortByDesc('total_amount')->values();

        return $this->success([
            'period'        => ['from' => $from, 'to' => $to],
            'total_pending' => round($commissions->where('status', 'pending')->sum('commission_amount'), 2),
            'total_paid'    => round($commissions->where('status', 'paid')->sum('commission_amount'), 2),
            'by_user'       => $byUser,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

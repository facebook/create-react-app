<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Inventory\Models\PurchaseRequisition;
use App\Modules\Inventory\Models\PurchaseRequisitionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseRequisitionApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $reqs     = PurchaseRequisition::where('tenant_id', $tenantId)
            ->with('requester:id,name', 'approver:id,name')
            ->withCount('items')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($r) => array_merge($r->toArray(), ['total_estimated_cost' => $r->load('items')->total_estimated_cost]));

        return $this->success($reqs);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'needed_by'       => ['nullable', 'date'],
            'notes'           => ['nullable', 'string'],
            'items'           => ['required', 'array', 'min:1'],
            'items.*.product_id'          => ['nullable', 'integer', 'exists:products,id'],
            'items.*.description'         => ['required', 'string'],
            'items.*.quantity'            => ['required', 'numeric', 'min:0.001'],
            'items.*.estimated_unit_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $ref = 'PR-' . strtoupper(uniqid());

        $requisition = PurchaseRequisition::create([
            'tenant_id'    => $tenantId,
            'reference'    => $ref,
            'requested_by' => $request->user()->id,
            'status'       => 'draft',
            'needed_by'    => $data['needed_by'] ?? null,
            'notes'        => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            PurchaseRequisitionItem::create([
                'purchase_requisition_id' => $requisition->id,
                'product_id'              => $item['product_id'] ?? null,
                'description'             => $item['description'],
                'quantity'                => $item['quantity'],
                'estimated_unit_cost'     => $item['estimated_unit_cost'] ?? 0,
            ]);
        }

        return $this->success($requisition->load('items.product:id,name,sku', 'requester:id,name'), 201);
    }

    public function show(PurchaseRequisition $purchaseRequisition): JsonResponse
    {
        $purchaseRequisition->load('items.product:id,name,sku', 'requester:id,name', 'approver:id,name');

        return $this->success(array_merge(
            $purchaseRequisition->toArray(),
            ['total_estimated_cost' => $purchaseRequisition->total_estimated_cost]
        ));
    }

    public function update(Request $request, PurchaseRequisition $purchaseRequisition): JsonResponse
    {
        if (! in_array($purchaseRequisition->status, ['draft', 'submitted'])) {
            return $this->error('Only draft or submitted requisitions can be updated.', 422);
        }

        $data = $request->validate([
            'needed_by' => ['nullable', 'date'],
            'notes'     => ['nullable', 'string'],
        ]);

        $purchaseRequisition->update($data);

        return $this->success($purchaseRequisition->fresh()->load('items'));
    }

    public function submit(PurchaseRequisition $purchaseRequisition): JsonResponse
    {
        if ($purchaseRequisition->status !== 'draft') {
            return $this->error('Only draft requisitions can be submitted.', 422);
        }

        $purchaseRequisition->update(['status' => 'submitted']);

        return $this->success($purchaseRequisition->fresh());
    }

    public function approve(Request $request, PurchaseRequisition $purchaseRequisition): JsonResponse
    {
        if ($purchaseRequisition->status !== 'submitted') {
            return $this->error('Only submitted requisitions can be approved.', 422);
        }

        $purchaseRequisition->update([
            'status'      => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return $this->success($purchaseRequisition->fresh()->load('approver:id,name'));
    }

    public function reject(Request $request, PurchaseRequisition $purchaseRequisition): JsonResponse
    {
        if ($purchaseRequisition->status !== 'submitted') {
            return $this->error('Only submitted requisitions can be rejected.', 422);
        }

        $data = $request->validate([
            'rejection_reason' => ['required', 'string'],
        ]);

        $purchaseRequisition->update([
            'status'           => 'rejected',
            'rejection_reason' => $data['rejection_reason'],
        ]);

        return $this->success($purchaseRequisition->fresh());
    }

    public function destroy(PurchaseRequisition $purchaseRequisition): JsonResponse
    {
        if ($purchaseRequisition->status !== 'draft') {
            return $this->error('Only draft requisitions can be deleted.', 422);
        }

        $purchaseRequisition->items()->delete();
        $purchaseRequisition->delete();

        return $this->success(['message' => 'Requisition deleted.']);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

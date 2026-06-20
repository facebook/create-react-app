<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Subcontracting\Models\SubcontractOrder;
use App\Modules\Subcontracting\Models\SubcontractComponent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubcontractingApiController extends ApiController
{
    /**
     * GET /api/v1/subcontracting/orders
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = SubcontractOrder::where('tenant_id', $tenantId);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($vendorId = $request->query('vendor_id')) {
            $query->where('vendor_id', $vendorId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/subcontracting/orders/{id}
     */
    public function show(int $id): JsonResponse
    {
        $order = SubcontractOrder::with(['components'])->findOrFail($id);

        return $this->success($order);
    }

    /**
     * POST /api/v1/subcontracting/orders
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vendor_id'        => 'required|integer',
            'reference'        => 'nullable|string|max:100',
            'finished_product' => 'required|string|max:255',
            'finished_qty'     => 'required|numeric|min:0',
            'unit_price'       => 'nullable|numeric|min:0',
            'notes'            => 'nullable|string',
            'components'       => 'nullable|array',
            'components.*.component_name' => 'required_with:components|string|max:255',
            'components.*.quantity'       => 'required_with:components|numeric|min:0',
            'components.*.unit'           => 'nullable|string|max:50',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $components = $validated['components'] ?? [];
        unset($validated['components']);

        $validated['tenant_id'] = $tenantId;
        $validated['status']    = 'draft';

        $order = SubcontractOrder::create($validated);

        foreach ($components as $component) {
            SubcontractComponent::create([
                'tenant_id'       => $tenantId,
                'subcontract_id'  => $order->id,
                'component_name'  => $component['component_name'],
                'quantity'        => $component['quantity'],
                'unit'            => $component['unit'] ?? null,
            ]);
        }

        return $this->success($order->load('components'), 201);
    }

    /**
     * PUT /api/v1/subcontracting/orders/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $order = SubcontractOrder::findOrFail($id);

        $validated = $request->validate([
            'vendor_id'        => 'sometimes|integer',
            'reference'        => 'nullable|string|max:100',
            'finished_product' => 'sometimes|string|max:255',
            'finished_qty'     => 'sometimes|numeric|min:0',
            'unit_price'       => 'nullable|numeric|min:0',
            'notes'            => 'nullable|string',
            'status'           => 'nullable|string|in:draft,sent,in_progress,done,cancelled',
            'sent_at'          => 'nullable|date',
            'received_at'      => 'nullable|date',
        ]);

        $order->update($validated);

        return $this->success($order);
    }
}

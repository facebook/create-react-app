<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Repairs\Models\RepairLine;
use App\Modules\Repairs\Models\RepairOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RepairsApiController extends ApiController
{
    /**
     * GET /api/v1/repairs
     */
    public function index(Request $request): JsonResponse
    {
        $query = RepairOrder::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/repairs/{id}
     */
    public function show(int $id): JsonResponse
    {
        $order = RepairOrder::with('lines')->findOrFail($id);

        return $this->success($order);
    }

    /**
     * POST /api/v1/repairs
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contact_id'      => 'nullable|integer',
            'product_id'      => 'nullable|integer',
            'product_name'    => 'nullable|string|max:255',
            'serial_number'   => 'nullable|string|max:100',
            'status'          => 'nullable|string|max:50',
            'priority'        => 'nullable|string|max:50',
            'diagnosis'       => 'nullable|string',
            'internal_notes'  => 'nullable|string',
            'warranty_claim'  => 'nullable|boolean',
            'scheduled_date'  => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'estimated_cost'  => 'nullable|numeric|min:0',
            'assigned_to'     => 'nullable|integer',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $order = RepairOrder::create(array_merge($validated, [
            'tenant_id'    => $tenantId,
            'order_number' => RepairOrder::generateOrderNumber($tenantId),
        ]));

        return $this->success($order, 201);
    }

    /**
     * PUT /api/v1/repairs/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $order = RepairOrder::findOrFail($id);

        $validated = $request->validate([
            'contact_id'      => 'nullable|integer',
            'product_id'      => 'nullable|integer',
            'product_name'    => 'nullable|string|max:255',
            'serial_number'   => 'nullable|string|max:100',
            'status'          => 'nullable|string|max:50',
            'priority'        => 'nullable|string|max:50',
            'diagnosis'       => 'nullable|string',
            'internal_notes'  => 'nullable|string',
            'warranty_claim'  => 'nullable|boolean',
            'scheduled_date'  => 'nullable|date',
            'started_at'      => 'nullable|date',
            'completed_at'    => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'actual_hours'    => 'nullable|numeric|min:0',
            'estimated_cost'  => 'nullable|numeric|min:0',
            'final_cost'      => 'nullable|numeric|min:0',
            'assigned_to'     => 'nullable|integer',
        ]);

        $order->update($validated);

        return $this->success($order->fresh());
    }

    /**
     * DELETE /api/v1/repairs/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $order = RepairOrder::findOrFail($id);
        $order->delete();

        return $this->success(['message' => 'Repair order deleted.']);
    }

    /**
     * POST /api/v1/repairs/{id}/lines
     */
    public function addLine(Request $request, int $id): JsonResponse
    {
        $order = RepairOrder::findOrFail($id);

        $validated = $request->validate([
            'line_type'   => 'required|string|in:part,labor,other',
            'product_id'  => 'nullable|integer',
            'description' => 'nullable|string',
            'quantity'    => 'required|numeric|min:0',
            'unit_price'  => 'required|numeric|min:0',
            'is_invoiced' => 'nullable|boolean',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $total = (float) $validated['quantity'] * (float) $validated['unit_price'];

        $line = RepairLine::create(array_merge($validated, [
            'tenant_id'       => $tenantId,
            'repair_order_id' => $order->id,
            'total'           => $total,
        ]));

        return $this->success($line, 201);
    }
}

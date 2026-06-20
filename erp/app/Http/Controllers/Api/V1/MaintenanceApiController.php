<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Maintenance\Models\Equipment;
use App\Modules\Maintenance\Models\MaintenanceOrder;
use App\Modules\Maintenance\Models\MaintenancePlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceApiController extends ApiController
{
    /**
     * GET /api/v1/maintenance/orders
     */
    public function orders(Request $request): JsonResponse
    {
        $query = MaintenanceOrder::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($equipmentId = $request->query('equipment_id')) {
            $query->where('equipment_id', $equipmentId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/maintenance/orders/{id}
     */
    public function showOrder(int $id): JsonResponse
    {
        $order = MaintenanceOrder::with('equipment')->findOrFail($id);

        return $this->success($order);
    }

    /**
     * POST /api/v1/maintenance/orders
     */
    public function storeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipment_id'     => 'required|integer',
            'plan_id'          => 'nullable|integer',
            'type'             => 'nullable|string|max:50',
            'priority'         => 'nullable|string|max:50',
            'status'           => 'nullable|string|max:50',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'scheduled_date'   => 'nullable|date',
            'estimated_hours'  => 'nullable|numeric|min:0',
            'assigned_to'      => 'nullable|integer',
            'reported_by'      => 'nullable|integer',
            'cost'             => 'nullable|numeric|min:0',
            'notes'            => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $order = MaintenanceOrder::create(array_merge($validated, [
            'tenant_id'    => $tenantId,
            'order_number' => MaintenanceOrder::generateOrderNumber($tenantId),
        ]));

        return $this->success($order, 201);
    }

    /**
     * GET /api/v1/maintenance/equipment
     */
    public function equipment(Request $request): JsonResponse
    {
        $query = Equipment::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/maintenance/equipment
     */
    public function storeEquipment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'code'            => 'nullable|string|max:100',
            'category'        => 'nullable|string|max:100',
            'location'        => 'nullable|string|max:255',
            'serial_number'   => 'nullable|string|max:100',
            'manufacturer'    => 'nullable|string|max:255',
            'model'           => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'status'          => 'nullable|string|max:50',
            'notes'           => 'nullable|string',
            'assigned_to'     => 'nullable|integer',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $equipment = Equipment::create(array_merge($validated, [
            'tenant_id' => $tenantId,
        ]));

        return $this->success($equipment, 201);
    }

    /**
     * GET /api/v1/maintenance/plans
     */
    public function plans(Request $request): JsonResponse
    {
        $query = MaintenancePlan::query();

        if ($equipmentId = $request->query('equipment_id')) {
            $query->where('equipment_id', $equipmentId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }
}

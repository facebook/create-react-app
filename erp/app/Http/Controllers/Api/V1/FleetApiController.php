<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Fleet\Models\FuelLog;
use App\Modules\Fleet\Models\Vehicle;
use App\Modules\Fleet\Models\VehicleAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FleetApiController extends ApiController
{
    /**
     * GET /api/v1/fleet/vehicles
     */
    public function vehicles(Request $request): JsonResponse
    {
        $query = Vehicle::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/fleet/vehicles/{id}
     */
    public function showVehicle(int $id): JsonResponse
    {
        $vehicle = Vehicle::with([
            'assignments' => fn ($q) => $q->latest()->limit(10),
        ])->findOrFail($id);

        return $this->success($vehicle);
    }

    /**
     * POST /api/v1/fleet/vehicles
     */
    public function storeVehicle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                 => 'required|string|max:255',
            'plate_number'         => 'required|string|max:50',
            'make'                 => 'nullable|string|max:100',
            'model'                => 'nullable|string|max:100',
            'year'                 => 'nullable|integer|min:1900|max:2100',
            'color'                => 'nullable|string|max:50',
            'vin'                  => 'nullable|string|max:100',
            'type'                 => 'nullable|string|max:50',
            'status'               => 'nullable|string|max:50',
            'odometer_km'          => 'nullable|numeric|min:0',
            'fuel_type'            => 'nullable|string|max:50',
            'assigned_to'          => 'nullable|integer',
            'insurance_expiry'     => 'nullable|date',
            'registration_expiry'  => 'nullable|date',
            'notes'                => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $vehicle = Vehicle::create(array_merge($validated, [
            'tenant_id' => $tenantId,
        ]));

        return $this->success($vehicle, 201);
    }

    /**
     * GET /api/v1/fleet/assignments
     */
    public function assignments(Request $request): JsonResponse
    {
        $query = VehicleAssignment::with(['vehicle:id,name,plate_number']);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/fleet/assignments
     */
    public function storeAssignment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id'     => 'required|integer',
            'driver_id'      => 'required|integer',
            'purpose'        => 'nullable|string|max:255',
            'assigned_at'    => 'nullable|date',
            'returned_at'    => 'nullable|date',
            'start_odometer' => 'nullable|numeric|min:0',
            'end_odometer'   => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $assignment = VehicleAssignment::create(array_merge($validated, [
            'tenant_id'   => $tenantId,
            'assigned_at' => $validated['assigned_at'] ?? now(),
        ]));

        return $this->success($assignment, 201);
    }

    /**
     * GET /api/v1/fleet/fuel-logs
     */
    public function fuelLogs(Request $request): JsonResponse
    {
        $query = FuelLog::with(['vehicle:id,name,plate_number']);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }
}

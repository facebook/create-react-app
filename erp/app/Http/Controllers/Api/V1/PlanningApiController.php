<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Planning\Models\Shift;
use App\Modules\Planning\Models\ShiftSwap;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanningApiController extends ApiController
{
    /**
     * GET /api/v1/planning/shifts
     */
    public function shifts(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = Shift::where('tenant_id', $tenantId);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($employeeId = $request->query('employee_id')) {
            $query->where('employee_id', $employeeId);
        }

        $paginator = $query->latest('starts_at')->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/planning/shifts/{id}
     */
    public function showShift(int $id): JsonResponse
    {
        $shift = Shift::with(['employee:id,name'])->findOrFail($id);

        return $this->success($shift);
    }

    /**
     * POST /api/v1/planning/shifts
     */
    public function storeShift(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id'    => 'required|integer|exists:users,id',
            'title'          => 'required|string|max:255',
            'starts_at'      => 'required|date',
            'ends_at'        => 'required|date|after:starts_at',
            'break_minutes'  => 'nullable|integer|min:0',
            'notes'          => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['status']    = 'scheduled';

        $shift = Shift::create($validated);

        return $this->success($shift, 201);
    }

    /**
     * GET /api/v1/planning/shifts/{id}/swaps
     */
    public function swaps(Request $request, int $id): JsonResponse
    {
        $shift = Shift::findOrFail($id);

        $paginator = ShiftSwap::where('shift_id', $shift->id)->latest()->paginate(20);

        return $this->paginated($paginator);
    }
}

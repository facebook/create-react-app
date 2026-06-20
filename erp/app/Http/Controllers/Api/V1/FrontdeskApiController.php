<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Frontdesk\Models\FrontdeskStation;
use App\Modules\Frontdesk\Models\VisitorLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FrontdeskApiController extends ApiController
{
    /**
     * GET /api/v1/frontdesk/stations
     */
    public function stations(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $paginator = FrontdeskStation::where('tenant_id', $tenantId)->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/frontdesk/visitors/check-in
     */
    public function checkIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'visitor_name'    => 'required|string|max:255',
            'visitor_email'   => 'nullable|email|max:255',
            'visitor_phone'   => 'nullable|string|max:50',
            'visitor_company' => 'nullable|string|max:255',
            'visit_purpose'   => 'required|string|max:255',
            'station_id'      => 'required|integer|exists:frontdesk_stations,id',
            'host_employee_id'=> 'nullable|integer|exists:users,id',
            'badge_number'    => 'nullable|string|max:50',
            'notes'           => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id']   = $tenantId;
        $validated['status']      = 'checked_in';
        $validated['check_in_at'] = now();

        $visitor = VisitorLog::create($validated);

        return $this->success($visitor, 201);
    }

    /**
     * POST /api/v1/frontdesk/visitors/{id}/checkout
     */
    public function checkOut(int $id): JsonResponse
    {
        $visitor = VisitorLog::findOrFail($id);
        $visitor->update([
            'status'        => 'checked_out',
            'check_out_at'  => now(),
        ]);

        return $this->success($visitor);
    }

    /**
     * GET /api/v1/frontdesk/visitors
     */
    public function visitors(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = VisitorLog::where('tenant_id', $tenantId);

        if ($stationId = $request->query('station_id')) {
            $query->where('station_id', $stationId);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('check_in_at', $date);
        }

        $paginator = $query->latest('check_in_at')->paginate(20);

        return $this->paginated($paginator);
    }
}

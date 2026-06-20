<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\QualityControl\Models\NonConformanceReport;
use App\Modules\QualityControl\Models\QcChecklist;
use App\Modules\QualityControl\Models\QcInspection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QualityControlApiController extends ApiController
{
    /**
     * GET /api/v1/quality/inspections
     */
    public function inspections(Request $request): JsonResponse
    {
        $query = QcInspection::with(['checklist:id,name']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($checklistId = $request->query('checklist_id')) {
            $query->where('checklist_id', $checklistId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/quality/inspections/{id}
     */
    public function showInspection(int $id): JsonResponse
    {
        $inspection = QcInspection::with(['checklist', 'results'])->findOrFail($id);

        return $this->success($inspection);
    }

    /**
     * POST /api/v1/quality/inspections
     */
    public function storeInspection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'checklist_id'   => 'required|integer',
            'reference_type' => 'nullable|string|max:100',
            'reference_id'   => 'nullable|integer',
            'inspector_id'   => 'nullable|integer',
            'status'         => 'nullable|string|max:50',
            'notes'          => 'nullable|string',
            'started_at'     => 'nullable|date',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $inspection = QcInspection::create(array_merge($validated, [
            'tenant_id' => $tenantId,
            'status'    => $validated['status'] ?? 'pending',
        ]));

        return $this->success($inspection, 201);
    }

    /**
     * PUT /api/v1/quality/inspections/{id}
     */
    public function updateInspection(Request $request, int $id): JsonResponse
    {
        $inspection = QcInspection::findOrFail($id);

        $validated = $request->validate([
            'checklist_id'   => 'sometimes|integer',
            'reference_type' => 'nullable|string|max:100',
            'reference_id'   => 'nullable|integer',
            'inspector_id'   => 'nullable|integer',
            'status'         => 'nullable|string|max:50',
            'notes'          => 'nullable|string',
            'started_at'     => 'nullable|date',
            'completed_at'   => 'nullable|date',
        ]);

        $inspection->update($validated);

        return $this->success($inspection->fresh());
    }

    /**
     * GET /api/v1/quality/alerts
     */
    public function alerts(Request $request): JsonResponse
    {
        $query = NonConformanceReport::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($severity = $request->query('severity')) {
            $query->where('severity', $severity);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/quality/checklists
     */
    public function checklists(Request $request): JsonResponse
    {
        $query = QcChecklist::query();

        if ($request->boolean('active')) {
            $query->active();
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }
}

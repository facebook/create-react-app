<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\QualityControl\Models\NonConformanceReport;
use App\Modules\QualityControl\Models\QcChecklist;
use App\Modules\QualityControl\Models\QcChecklistItem;
use App\Modules\QualityControl\Models\QcInspection;
use App\Modules\QualityControl\Models\QcInspectionResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QcApiController extends ApiController
{
    // ── Checklists ────────────────────────────────────────────────────────────

    public function indexChecklists(Request $request): JsonResponse
    {
        $tenantId   = $this->tenantId($request);
        $checklists = QcChecklist::where('tenant_id', $tenantId)
            ->withCount('items')
            ->when($request->input('category'), fn ($q, $c) => $q->where('category', $c))
            ->when($request->boolean('active_only'), fn ($q) => $q->active())
            ->orderBy('name')
            ->get();

        return $this->success($checklists);
    }

    public function storeChecklist(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'category'    => ['nullable', 'in:incoming,process,final,audit'],
            'items'       => ['nullable', 'array'],
            'items.*.description'    => ['required', 'string'],
            'items.*.check_type'     => ['required', 'in:pass_fail,measurement,text'],
            'items.*.expected_value' => ['nullable', 'string'],
            'items.*.unit'           => ['nullable', 'string', 'max:20'],
            'items.*.is_required'    => ['boolean'],
            'items.*.sequence'       => ['integer', 'min:1'],
        ]);

        $checklist = QcChecklist::create([
            'tenant_id'   => $tenantId,
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'category'    => $data['category'] ?? null,
            'is_active'   => true,
            'created_by'  => $request->user()->id,
        ]);

        foreach ($data['items'] ?? [] as $i => $item) {
            QcChecklistItem::create([
                'tenant_id'      => $tenantId,
                'checklist_id'   => $checklist->id,
                'description'    => $item['description'],
                'check_type'     => $item['check_type'],
                'expected_value' => $item['expected_value'] ?? null,
                'unit'           => $item['unit'] ?? null,
                'is_required'    => $item['is_required'] ?? true,
                'sequence'       => $item['sequence'] ?? ($i + 1),
            ]);
        }

        return $this->success($checklist->load('items'), 201);
    }

    public function showChecklist(QcChecklist $qcChecklist): JsonResponse
    {
        return $this->success($qcChecklist->load('items'));
    }

    public function destroyChecklist(QcChecklist $qcChecklist): JsonResponse
    {
        $qcChecklist->items()->delete();
        $qcChecklist->delete();

        return $this->success(['message' => 'Checklist deleted.']);
    }

    // ── Inspections ───────────────────────────────────────────────────────────

    public function indexInspections(Request $request): JsonResponse
    {
        $tenantId    = $this->tenantId($request);
        $inspections = QcInspection::where('tenant_id', $tenantId)
            ->with('checklist:id,name', 'inspector:id,name')
            ->withCount('results')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($i) => array_merge($i->toArray(), ['pass_rate' => $i->load('results')->passRate()]));

        return $this->success($inspections);
    }

    public function storeInspection(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'checklist_id'   => ['required', 'integer', 'exists:quality_checklists,id'],
            'reference_type' => ['nullable', 'string', 'max:50'],
            'reference_id'   => ['nullable', 'integer'],
            'notes'          => ['nullable', 'string'],
        ]);

        $inspection = QcInspection::create([
            'tenant_id'      => $tenantId,
            'checklist_id'   => $data['checklist_id'],
            'reference_type' => $data['reference_type'] ?? null,
            'reference_id'   => $data['reference_id'] ?? null,
            'inspector_id'   => $request->user()->id,
            'status'         => 'pending',
            'notes'          => $data['notes'] ?? null,
        ]);

        return $this->success($inspection->load('checklist.items', 'inspector:id,name'), 201);
    }

    public function showInspection(QcInspection $qcInspection): JsonResponse
    {
        $qcInspection->load('checklist.items', 'results.item', 'inspector:id,name');

        return $this->success(array_merge($qcInspection->toArray(), ['pass_rate' => $qcInspection->passRate()]));
    }

    public function startInspection(QcInspection $qcInspection): JsonResponse
    {
        if ($qcInspection->status !== 'pending') {
            return $this->error('Only pending inspections can be started.', 422);
        }

        $qcInspection->start();

        return $this->success($qcInspection->fresh());
    }

    public function recordResults(Request $request, QcInspection $qcInspection): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        if ($qcInspection->status !== 'in_progress') {
            return $this->error('Only in-progress inspections can have results recorded.', 422);
        }

        $data = $request->validate([
            'results'                   => ['required', 'array', 'min:1'],
            'results.*.checklist_item_id' => ['required', 'integer', 'exists:quality_checklist_items,id'],
            'results.*.result'          => ['required', 'in:pass,fail,na'],
            'results.*.measured_value'  => ['nullable', 'string'],
            'results.*.notes'           => ['nullable', 'string'],
        ]);

        foreach ($data['results'] as $resultData) {
            QcInspectionResult::updateOrCreate(
                ['inspection_id' => $qcInspection->id, 'checklist_item_id' => $resultData['checklist_item_id']],
                [
                    'tenant_id'      => $tenantId,
                    'result'         => $resultData['result'],
                    'measured_value' => $resultData['measured_value'] ?? null,
                    'notes'          => $resultData['notes'] ?? null,
                ]
            );
        }

        return $this->success([
            'results_recorded' => count($data['results']),
            'pass_rate'        => $qcInspection->fresh()->load('results')->passRate(),
        ]);
    }

    public function completeInspection(Request $request, QcInspection $qcInspection): JsonResponse
    {
        if ($qcInspection->status !== 'in_progress') {
            return $this->error('Only in-progress inspections can be completed.', 422);
        }

        $data = $request->validate([
            'outcome' => ['required', 'in:passed,failed'],
        ]);

        $qcInspection->complete($data['outcome']);

        return $this->success(array_merge($qcInspection->fresh()->toArray(), [
            'pass_rate' => $qcInspection->load('results')->passRate(),
        ]));
    }

    // ── Non-Conformance Reports ───────────────────────────────────────────────

    public function indexNcr(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $ncrs     = NonConformanceReport::where('tenant_id', $tenantId)
            ->with('reporter:id,name', 'assignee:id,name')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('severity'), fn ($q, $s) => $q->where('severity', $s))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($n) => array_merge($n->toArray(), ['is_overdue' => $n->isOverdue()]));

        return $this->success($ncrs);
    }

    public function storeNcr(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'inspection_id' => ['nullable', 'integer', 'exists:quality_inspections,id'],
            'title'         => ['required', 'string', 'max:200'],
            'description'   => ['required', 'string'],
            'severity'      => ['required', 'in:minor,major,critical'],
            'assigned_to'   => ['nullable', 'integer', 'exists:users,id'],
            'due_date'      => ['nullable', 'date'],
        ]);

        $ncr = NonConformanceReport::create([
            'tenant_id'     => $tenantId,
            'inspection_id' => $data['inspection_id'] ?? null,
            'ncr_number'    => NonConformanceReport::generateNumber($tenantId),
            'title'         => $data['title'],
            'description'   => $data['description'],
            'severity'      => $data['severity'],
            'status'        => 'open',
            'reported_by'   => $request->user()->id,
            'assigned_to'   => $data['assigned_to'] ?? null,
            'due_date'      => $data['due_date'] ?? null,
        ]);

        return $this->success($ncr->load('reporter:id,name', 'assignee:id,name'), 201);
    }

    public function resolveNcr(Request $request, NonConformanceReport $ncr): JsonResponse
    {
        if ($ncr->status !== 'open') {
            return $this->error('Only open NCRs can be resolved.', 422);
        }

        $data = $request->validate([
            'root_cause'        => ['required', 'string'],
            'corrective_action' => ['required', 'string'],
        ]);

        $ncr->resolve($data['root_cause'], $data['corrective_action']);

        return $this->success($ncr->fresh());
    }

    public function closeNcr(NonConformanceReport $ncr): JsonResponse
    {
        if ($ncr->status !== 'resolved') {
            return $this->error('Only resolved NCRs can be closed.', 422);
        }

        $ncr->close();

        return $this->success($ncr->fresh());
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\CRM\Models\CrmLead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrmApiController extends ApiController
{
    /**
     * GET /api/v1/crm/leads
     */
    public function index(Request $request): JsonResponse
    {
        $query = CrmLead::with(['stage:id,name', 'assignee:id,name']);

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($assignedTo = $request->query('assigned_to')) {
            $query->where('assigned_to', $assignedTo);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/crm/leads/{id}
     */
    public function show(int $id): JsonResponse
    {
        $lead = CrmLead::with(['stage', 'activities', 'assignee:id,name'])->findOrFail($id);

        return $this->success($lead);
    }

    /**
     * POST /api/v1/crm/leads
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'type'             => 'nullable|string|in:lead,opportunity',
            'contact_name'     => 'nullable|string|max:255',
            'company_name'     => 'nullable|string|max:255',
            'email'            => 'nullable|email|max:255',
            'phone'            => 'nullable|string|max:50',
            'source'           => 'nullable|string|max:100',
            'expected_revenue' => 'nullable|numeric|min:0',
            'probability'      => 'nullable|numeric|min:0|max:100',
            'priority'         => 'nullable|string',
            'stage_id'         => 'nullable|integer|exists:crm_stages,id',
            'assigned_to'      => 'nullable|integer|exists:users,id',
            'description'      => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['created_by'] = $request->user()->id;

        $lead = CrmLead::create($validated);

        return $this->success($lead, 201);
    }

    /**
     * PUT /api/v1/crm/leads/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $lead = CrmLead::findOrFail($id);

        $validated = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'type'             => 'nullable|string|in:lead,opportunity',
            'contact_name'     => 'nullable|string|max:255',
            'company_name'     => 'nullable|string|max:255',
            'email'            => 'nullable|email|max:255',
            'phone'            => 'nullable|string|max:50',
            'source'           => 'nullable|string|max:100',
            'expected_revenue' => 'nullable|numeric|min:0',
            'probability'      => 'nullable|numeric|min:0|max:100',
            'priority'         => 'nullable|string',
            'stage_id'         => 'nullable|integer|exists:crm_stages,id',
            'assigned_to'      => 'nullable|integer|exists:users,id',
            'description'      => 'nullable|string',
        ]);

        $lead->update($validated);

        return $this->success($lead);
    }

    /**
     * DELETE /api/v1/crm/leads/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $lead = CrmLead::findOrFail($id);
        $lead->delete();

        return $this->success(['message' => 'Lead deleted']);
    }

    /**
     * POST /api/v1/crm/leads/{lead}/won
     */
    public function markWon(int $lead): JsonResponse
    {
        $crmLead = CrmLead::findOrFail($lead);
        $crmLead->markWon();

        return $this->success($crmLead);
    }

    /**
     * POST /api/v1/crm/leads/{lead}/lost
     */
    public function markLost(Request $request, int $lead): JsonResponse
    {
        $crmLead = CrmLead::findOrFail($lead);

        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $crmLead->markLost($validated['reason'] ?? '');

        return $this->success($crmLead);
    }
}

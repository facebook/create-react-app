<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Approvals\Models\ApprovalRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalsApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = ApprovalRequest::where('tenant_id', $tenantId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('requestor_id')) {
            $query->where('requested_by', $request->requestor_id);
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function show(int $id): JsonResponse
    {
        $approvalRequest = ApprovalRequest::with([
            'requestedBy',
            'actions.actor',
            'workflow.steps.approver',
        ])->findOrFail($id);

        return $this->success($approvalRequest);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated = $request->validate([
            'workflow_id'  => 'required|integer|exists:approval_workflows,id',
            'entity_type'  => 'required|string|max:100',
            'entity_id'    => 'required|integer',
            'entity_title' => 'required|string|max:255',
        ]);

        $validated['tenant_id']    = $tenantId;
        $validated['requested_by'] = $request->user()->id;
        $validated['status']       = 'pending';
        $validated['current_step'] = 1;

        $approvalRequest = ApprovalRequest::create($validated);

        return $this->success($approvalRequest->load('workflow'), 201);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $approvalRequest = ApprovalRequest::findOrFail($id);

        $approvalRequest->update([
            'status'      => 'approved',
            'approved_at' => now(),
        ]);

        return $this->success($approvalRequest->fresh());
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $approvalRequest = ApprovalRequest::findOrFail($id);

        $approvalRequest->update([
            'status'           => 'rejected',
            'rejected_at'      => now(),
            'rejection_reason' => $validated['reason'],
        ]);

        return $this->success($approvalRequest->fresh());
    }
}

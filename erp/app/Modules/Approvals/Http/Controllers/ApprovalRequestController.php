<?php

namespace App\Modules\Approvals\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Approvals\Models\ApprovalRequest;
use App\Modules\Approvals\Models\ApprovalStep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ApprovalRequest::withoutGlobalScopes()
            ->where('approval_requests.tenant_id', auth()->user()->tenant_id)
            ->with(['workflow', 'requestedBy'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        $requests = $query->paginate(25)->withQueryString();

        return Inertia::render('Approvals/Requests/Index', [
            'requests' => $requests,
            'filters'  => $request->only(['status', 'entity_type']),
        ]);
    }

    public function show(ApprovalRequest $approvalRequest): Response
    {
        $approvalRequest->load([
            'workflow.steps.approver',
            'requestedBy',
            'actions.actor',
        ]);

        $canApprove = $approvalRequest->canApprove(auth()->user());

        return Inertia::render('Approvals/Requests/Show', [
            'approvalRequest' => $approvalRequest,
            'canApprove'      => $canApprove,
        ]);
    }

    public function approve(Request $request, ApprovalRequest $approvalRequest): RedirectResponse
    {
        $data = $request->validate([
            'comments' => 'nullable|string|max:1000',
        ]);

        if (! $approvalRequest->canApprove(auth()->user())) {
            return back()->with('error', 'You are not authorized to approve this request.');
        }

        $approvalRequest->approve(auth()->user(), $data['comments'] ?? '');

        return back()->with('success', 'Request approved successfully.');
    }

    public function reject(Request $request, ApprovalRequest $approvalRequest): RedirectResponse
    {
        $data = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        if (! $approvalRequest->canApprove(auth()->user())) {
            return back()->with('error', 'You are not authorized to reject this request.');
        }

        $approvalRequest->reject(auth()->user(), $data['reason']);

        return back()->with('success', 'Request rejected.');
    }

    public function cancel(ApprovalRequest $approvalRequest): RedirectResponse
    {
        if (! $approvalRequest->isPending()) {
            return back()->with('error', 'Only pending requests can be cancelled.');
        }

        $approvalRequest->cancel();

        return back()->with('success', 'Request cancelled.');
    }

    public function myPending(): Response
    {
        $user = auth()->user();

        // Find approval steps where this user is the approver by ID or by role
        $userRoles = $user->getRoleNames()->toArray();

        $requests = ApprovalRequest::withoutGlobalScopes()
            ->where('approval_requests.tenant_id', $user->tenant_id)
            ->where('approval_requests.status', 'pending')
            ->with(['workflow', 'requestedBy'])
            ->whereHas('workflow.steps', function ($query) use ($user, $userRoles) {
                $query->whereColumn('approval_steps.step_number', 'approval_requests.current_step')
                    ->where('approval_steps.workflow_id', \DB::raw('approval_requests.workflow_id'))
                    ->where(function ($q) use ($user, $userRoles) {
                        $q->where('approval_steps.approver_id', $user->id);
                        if (! empty($userRoles)) {
                            $q->orWhereIn('approval_steps.approver_role', $userRoles);
                        }
                    });
            })
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Approvals/Requests/MyPending', [
            'requests' => $requests,
        ]);
    }
}

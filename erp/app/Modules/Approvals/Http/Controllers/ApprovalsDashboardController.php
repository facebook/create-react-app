<?php

namespace App\Modules\Approvals\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Approvals\Models\ApprovalRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalsDashboardController extends Controller
{
    public function index(): Response
    {
        $user     = auth()->user();
        $tenantId = $user->tenant_id;

        $pendingRequests = ApprovalRequest::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->count();

        $approvedToday = ApprovalRequest::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('status', 'approved')
            ->whereDate('approved_at', today())
            ->count();

        $rejectedToday = ApprovalRequest::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('status', 'rejected')
            ->whereDate('rejected_at', today())
            ->count();

        $userRoles = $user->getRoleNames()->toArray();

        $myPendingCount = ApprovalRequest::withoutGlobalScopes()
            ->where('approval_requests.tenant_id', $tenantId)
            ->where('approval_requests.status', 'pending')
            ->whereHas('workflow.steps', function ($query) use ($user, $userRoles) {
                $query->whereColumn('approval_steps.step_number', 'approval_requests.current_step')
                    ->where('approval_steps.workflow_id', DB::raw('approval_requests.workflow_id'))
                    ->where(function ($q) use ($user, $userRoles) {
                        $q->where('approval_steps.approver_id', $user->id);
                        if (! empty($userRoles)) {
                            $q->orWhereIn('approval_steps.approver_role', $userRoles);
                        }
                    });
            })
            ->count();

        $recentRequests = ApprovalRequest::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->with(['workflow', 'requestedBy'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('Approvals/Dashboard', [
            'stats' => [
                'pending_requests' => $pendingRequests,
                'approved_today'   => $approvedToday,
                'rejected_today'   => $rejectedToday,
                'my_pending'       => $myPendingCount,
            ],
            'recentRequests' => $recentRequests,
        ]);
    }
}

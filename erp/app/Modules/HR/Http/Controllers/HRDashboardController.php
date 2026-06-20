<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\JobPosition;
use Inertia\Inertia;
use Inertia\Response;

class HRDashboardController extends Controller
{
    public function index(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $totalEmployees   = Employee::where('tenant_id', $tenantId)->where('status', 'active')->count();
        $pendingLeaves    = LeaveRequest::where('tenant_id', $tenantId)->where('status', 'pending')->count();
        $onLeaveToday     = LeaveRequest::where('tenant_id', $tenantId)->where('status', 'approved')
            ->whereDate('start_date', '<=', now())->whereDate('end_date', '>=', now())->count();
        $totalDepartments = Department::where('tenant_id', $tenantId)->count();
        $openPositions    = JobPosition::where('tenant_id', $tenantId)->where('status', 'open')->count();
        $newHiresThisMonth = Employee::where('tenant_id', $tenantId)
            ->whereYear('created_at', now()->year)->whereMonth('created_at', now()->month)->count();

        $recentLeaveRequests = LeaveRequest::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->with(['employee', 'leaveType'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($lr) => [
                'id'         => $lr->id,
                'employee'   => $lr->employee?->first_name . ' ' . $lr->employee?->last_name,
                'type'       => $lr->leaveType?->name,
                'start_date' => $lr->start_date,
                'end_date'   => $lr->end_date,
                'status'     => $lr->status,
            ]);

        $departmentHeadcount = Department::where('tenant_id', $tenantId)
            ->withCount(['employees as active_count' => fn($q) => $q->where('status', 'active')])
            ->orderByDesc('active_count')
            ->take(8)
            ->get()
            ->map(fn($d) => ['name' => $d->name, 'count' => $d->active_count]);

        return Inertia::render('HR/Dashboard', compact(
            'totalEmployees', 'pendingLeaves', 'onLeaveToday', 'totalDepartments',
            'openPositions', 'newHiresThisMonth', 'recentLeaveRequests', 'departmentHeadcount'
        ));
    }
}

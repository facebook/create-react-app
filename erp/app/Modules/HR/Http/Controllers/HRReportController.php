<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HRReportController extends Controller
{
    // GET /hr/reports/headcount
    public function headcount(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $totalActive = Employee::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->count();

        $newHiresThisMonth = Employee::where('tenant_id', $tenantId)
            ->whereYear('start_date', now()->year)
            ->whereMonth('start_date', now()->month)
            ->count();

        $terminationsThisMonth = Employee::where('tenant_id', $tenantId)
            ->whereYear('end_date', now()->year)
            ->whereMonth('end_date', now()->month)
            ->count();

        $turnoverRate = $totalActive > 0
            ? round(($terminationsThisMonth / max($totalActive, 1)) * 100, 2)
            : 0;

        $departments = Department::where('tenant_id', $tenantId)
            ->withCount(['employees as active_count' => fn($q) => $q->where('status', 'active')])
            ->orderByDesc('active_count')
            ->get()
            ->map(fn($d) => [
                'id'         => $d->id,
                'name'       => $d->name,
                'count'      => $d->active_count,
                'percentage' => $totalActive > 0
                    ? round(($d->active_count / $totalActive) * 100, 1)
                    : 0,
            ]);

        return Inertia::render('HR/Reports/Headcount', [
            'totalActive'           => $totalActive,
            'newHiresThisMonth'     => $newHiresThisMonth,
            'terminationsThisMonth' => $terminationsThisMonth,
            'turnoverRate'          => $turnoverRate,
            'departments'           => $departments,
        ]);
    }

    // GET /hr/reports/leave-summary
    public function leaveSummary(Request $request): Response
    {
        $tenantId  = auth()->user()->tenant_id;
        $dateFrom  = $request->input('date_from', now()->startOfMonth()->toDateString());
        $dateTo    = $request->input('date_to',   now()->endOfMonth()->toDateString());

        $query = LeaveRequest::where('tenant_id', $tenantId)
            ->where(function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('start_date', [$dateFrom, $dateTo])
                  ->orWhereBetween('end_date', [$dateFrom, $dateTo]);
            });

        $totalRequests = (clone $query)->count();
        $approvedCount = (clone $query)->where('status', 'approved')->count();
        $pendingCount  = (clone $query)->where('status', 'pending')->count();
        $rejectedCount = (clone $query)->where('status', 'rejected')->count();

        // Total days from approved requests
        $totalDays = (clone $query)->where('status', 'approved')
            ->get()
            ->sum(fn($lr) => $lr->days ?? 0);

        // Leave type breakdown
        $leaveTypes = LeaveType::where('tenant_id', $tenantId)->get();
        $typeBreakdown = $leaveTypes->map(function ($lt) use ($query, $tenantId, $dateFrom, $dateTo) {
            $typeQuery = LeaveRequest::where('tenant_id', $tenantId)
                ->where('leave_type_id', $lt->id)
                ->where(function ($q) use ($dateFrom, $dateTo) {
                    $q->whereBetween('start_date', [$dateFrom, $dateTo])
                      ->orWhereBetween('end_date', [$dateFrom, $dateTo]);
                });

            $approvedDays = (clone $typeQuery)->where('status', 'approved')
                ->get()
                ->sum(fn($lr) => $lr->days ?? 0);
            $pendingDays  = (clone $typeQuery)->where('status', 'pending')
                ->get()
                ->sum(fn($lr) => $lr->days ?? 0);

            return [
                'id'           => $lt->id,
                'name'         => $lt->name,
                'count'        => (clone $typeQuery)->count(),
                'approvedDays' => $approvedDays,
                'pendingDays'  => $pendingDays,
            ];
        })->filter(fn($t) => $t['count'] > 0)->values();

        // Detailed list
        $details = (clone $query)
            ->with(['employee', 'leaveType'])
            ->orderByDesc('start_date')
            ->get()
            ->map(fn($lr) => [
                'id'         => $lr->id,
                'employee'   => $lr->employee?->first_name . ' ' . $lr->employee?->last_name,
                'leaveType'  => $lr->leaveType?->name ?? '—',
                'start_date' => $lr->start_date?->toDateString(),
                'end_date'   => $lr->end_date?->toDateString(),
                'days'       => $lr->days ?? 0,
                'status'     => $lr->status,
            ]);

        return Inertia::render('HR/Reports/LeaveSummary', [
            'dateFrom'      => $dateFrom,
            'dateTo'        => $dateTo,
            'totalRequests' => $totalRequests,
            'totalDays'     => $totalDays,
            'approvedCount' => $approvedCount,
            'pendingCount'  => $pendingCount,
            'rejectedCount' => $rejectedCount,
            'typeBreakdown' => $typeBreakdown,
            'details'       => $details,
        ]);
    }

    // GET /hr/reports/department-summary
    public function departmentSummary(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $totalEmployees = Employee::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->count();

        $departments = Department::where('tenant_id', $tenantId)
            ->with(['employees' => fn($q) => $q->where('status', 'active')->whereNotNull('start_date')])
            ->orderBy('name')
            ->get()
            ->map(function ($dept) use ($totalEmployees) {
                $employees   = $dept->employees;
                $count       = $employees->count();
                $avgTenure   = 0;

                if ($count > 0) {
                    $tenureSum = $employees->sum(fn($e) => $e->start_date
                        ? $e->start_date->diffInMonths(now())
                        : 0);
                    $avgTenure = round($tenureSum / $count, 1);
                }

                return [
                    'id'         => $dept->id,
                    'name'       => $dept->name,
                    'count'      => $count,
                    'avgTenure'  => $avgTenure,
                    'percentage' => $totalEmployees > 0
                        ? round(($count / $totalEmployees) * 100, 1)
                        : 0,
                ];
            });

        return Inertia::render('HR/Reports/DepartmentSummary', [
            'departments'    => $departments,
            'totalEmployees' => $totalEmployees,
        ]);
    }

    // GET /hr/reports/employee-tenure
    public function employeeTenure(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $employees = Employee::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->whereNotNull('start_date')
            ->with('department')
            ->orderBy('start_date')
            ->get()
            ->map(function ($e) {
                $tenureMonths = $e->start_date->diffInMonths(now());
                $tenureYears  = round($tenureMonths / 12, 1);

                $bucket = match (true) {
                    $tenureMonths < 12   => '<1yr',
                    $tenureMonths < 36   => '1-3yr',
                    $tenureMonths < 60   => '3-5yr',
                    default              => '5+yr',
                };

                return [
                    'id'           => $e->id,
                    'name'         => $e->first_name . ' ' . $e->last_name,
                    'department'   => $e->department?->name ?? '—',
                    'hire_date'    => $e->start_date->toDateString(),
                    'tenureMonths' => $tenureMonths,
                    'tenureYears'  => $tenureYears,
                    'bucket'       => $bucket,
                ];
            });

        $buckets = [
            '<1yr'  => $employees->filter(fn($e) => $e['bucket'] === '<1yr')->count(),
            '1-3yr' => $employees->filter(fn($e) => $e['bucket'] === '1-3yr')->count(),
            '3-5yr' => $employees->filter(fn($e) => $e['bucket'] === '3-5yr')->count(),
            '5+yr'  => $employees->filter(fn($e) => $e['bucket'] === '5+yr')->count(),
        ];

        return Inertia::render('HR/Reports/EmployeeTenure', [
            'employees' => $employees->values(),
            'buckets'   => $buckets,
        ]);
    }
}

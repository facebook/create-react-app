<?php

namespace App\Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\CrmStage;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CrmDashboardController extends Controller
{
    public function index(): Response
    {
        $now          = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        $totalLeads = CrmLead::where('type', 'lead')
            ->where('status', 'open')
            ->count();

        $totalOpportunities = CrmLead::where('type', 'opportunity')
            ->where('status', 'open')
            ->count();

        $totalExpectedRevenue = CrmLead::where('status', 'open')
            ->sum('expected_revenue');

        $wonThisMonth = CrmLead::where('status', 'won')
            ->where('won_at', '>=', $startOfMonth)
            ->count();

        $wonRevenueThisMonth = CrmLead::where('status', 'won')
            ->where('won_at', '>=', $startOfMonth)
            ->sum('expected_revenue');

        $wonLast30 = CrmLead::where('status', 'won')
            ->where('won_at', '>=', $thirtyDaysAgo)
            ->count();

        $lostLast30 = CrmLead::where('status', 'lost')
            ->where('lost_at', '>=', $thirtyDaysAgo)
            ->count();

        $total30 = $wonLast30 + $lostLast30;
        $conversionRate = $total30 > 0
            ? round(($wonLast30 / $total30) * 100, 1)
            : 0;

        $pipelineByStage = CrmStage::withCount([
            'leads as lead_count' => fn ($q) => $q->where('status', 'open'),
        ])->withSum(
            ['leads as expected_revenue_sum' => fn ($q) => $q->where('status', 'open')],
            'expected_revenue'
        )->orderBy('sequence')->get(['id', 'name', 'color', 'sequence']);

        $recentLeads = CrmLead::with(['stage', 'assignee'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'reference', 'title', 'stage_id', 'assigned_to', 'priority', 'expected_close_date', 'status']);

        return Inertia::render('CRM/Dashboard', [
            'stats' => [
                'totalLeads'           => $totalLeads,
                'totalOpportunities'   => $totalOpportunities,
                'totalExpectedRevenue' => (float) $totalExpectedRevenue,
                'wonThisMonth'         => $wonThisMonth,
                'wonRevenueThisMonth'  => (float) $wonRevenueThisMonth,
                'conversionRate'       => $conversionRate,
            ],
            'pipelineByStage' => $pipelineByStage,
            'recentLeads'     => $recentLeads,
        ]);
    }
}

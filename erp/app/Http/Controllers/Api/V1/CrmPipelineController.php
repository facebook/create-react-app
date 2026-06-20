<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\CrmStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CrmPipelineController extends ApiController
{
    public function funnel(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $stages = CrmStage::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('sequence')
            ->withCount(['leads as open_count' => fn ($q) => $q->where('status', 'open')])
            ->withCount(['leads as total_count'])
            ->get()
            ->map(function ($stage) use ($tenantId) {
                $revenue = CrmLead::where('tenant_id', $tenantId)
                    ->where('stage_id', $stage->id)
                    ->where('status', 'open')
                    ->sum('expected_revenue');

                return [
                    'stage_id'          => $stage->id,
                    'stage_name'        => $stage->name,
                    'sequence'          => $stage->sequence,
                    'open_deals'        => $stage->open_count,
                    'total_deals'       => $stage->total_count,
                    'expected_revenue'  => round($revenue, 2),
                    'probability'       => $stage->probability,
                    'weighted_value'    => round($revenue * ($stage->probability / 100), 2),
                ];
            });

        $total = [
            'pipeline_value'   => $stages->sum('expected_revenue'),
            'weighted_value'   => $stages->sum('weighted_value'),
            'open_deals'       => $stages->sum('open_deals'),
        ];

        return $this->success(['stages' => $stages, 'total' => $total]);
    }

    public function winRate(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $from     = $request->get('from', now()->subMonths(12)->toDateString());
        $to       = $request->get('to', now()->toDateString());

        $won  = CrmLead::where('tenant_id', $tenantId)->where('status', 'won')
            ->whereBetween('won_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->count();
        $lost = CrmLead::where('tenant_id', $tenantId)->where('status', 'lost')
            ->whereBetween('lost_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->count();

        $total    = $won + $lost;
        $rate     = $total > 0 ? round($won / $total * 100, 2) : 0;

        $wonRevenue = CrmLead::where('tenant_id', $tenantId)->where('status', 'won')
            ->whereBetween('won_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->sum('expected_revenue');

        return $this->success([
            'won'         => $won,
            'lost'        => $lost,
            'total'       => $total,
            'win_rate'    => $rate,
            'won_revenue' => round($wonRevenue, 2),
            'period'      => ['from' => $from, 'to' => $to],
        ]);
    }

    public function velocity(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $won = CrmLead::where('tenant_id', $tenantId)
            ->where('status', 'won')
            ->whereNotNull('won_at')
            ->select(['created_at', 'won_at', 'expected_revenue'])
            ->get();

        $avgDays = $won->isNotEmpty()
            ? $won->avg(fn ($l) => $l->created_at->diffInDays($l->won_at))
            : 0;

        $avgRevenue = $won->avg('expected_revenue') ?? 0;

        return $this->success([
            'deals_analyzed'       => $won->count(),
            'avg_days_to_close'    => round($avgDays, 1),
            'avg_deal_value'       => round($avgRevenue, 2),
            'deals_closed_per_month' => $won->count() > 0
                ? round($won->count() / max(1, now()->diffInMonths($won->min('won_at') ?: now())), 1)
                : 0,
        ]);
    }

    public function leaderboard(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $leaders = CrmLead::where('tenant_id', $tenantId)
            ->where('status', 'won')
            ->whereNotNull('assigned_to')
            ->select('assigned_to', DB::raw('COUNT(*) as deals_won'), DB::raw('SUM(expected_revenue) as revenue'))
            ->groupBy('assigned_to')
            ->orderByDesc('revenue')
            ->with('assignee:id,name')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'user_id'   => $row->assigned_to,
                'name'      => $row->assignee?->name ?? 'Unknown',
                'deals_won' => $row->deals_won,
                'revenue'   => round($row->revenue, 2),
            ]);

        return $this->success($leaders);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

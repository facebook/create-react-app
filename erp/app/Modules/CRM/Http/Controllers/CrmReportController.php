<?php

namespace App\Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\CrmStage;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CrmReportController extends Controller
{
    public function pipeline(): Response
    {
        $stages = CrmStage::withCount([
            'leads as lead_count'        => fn ($q) => $q->where('type', 'lead'),
            'leads as opportunity_count' => fn ($q) => $q->where('type', 'opportunity'),
        ])->withSum(
            ['leads as expected_revenue_sum' => fn ($q) => $q->whereIn('status', ['open', 'won'])],
            'expected_revenue'
        )->withAvg(
            ['leads as avg_probability' => fn ($q) => $q->where('status', 'open')],
            'probability'
        )->orderBy('sequence')->get();

        return Inertia::render('CRM/Reports/Pipeline', [
            'stages' => $stages,
        ]);
    }

    public function winLoss(): Response
    {
        $months = collect(range(5, 0))->map(function ($i) {
            $month = Carbon::now()->subMonths($i);

            $won = CrmLead::where('status', 'won')
                ->whereYear('won_at', $month->year)
                ->whereMonth('won_at', $month->month)
                ->count();

            $wonRevenue = CrmLead::where('status', 'won')
                ->whereYear('won_at', $month->year)
                ->whereMonth('won_at', $month->month)
                ->sum('expected_revenue');

            $lost = CrmLead::where('status', 'lost')
                ->whereYear('lost_at', $month->year)
                ->whereMonth('lost_at', $month->month)
                ->count();

            $total = $won + $lost;

            return [
                'month'          => $month->format('M Y'),
                'won'            => $won,
                'won_revenue'    => (float) $wonRevenue,
                'lost'           => $lost,
                'conversion_rate'=> $total > 0 ? round(($won / $total) * 100, 1) : 0,
            ];
        });

        return Inertia::render('CRM/Reports/WinLoss', [
            'months' => $months,
            'totals' => [
                'won'         => $months->sum('won'),
                'lost'        => $months->sum('lost'),
                'won_revenue' => $months->sum('won_revenue'),
            ],
        ]);
    }

    public function source(): Response
    {
        $sources = CrmLead::selectRaw(
            "COALESCE(source, 'Unknown') as source_name,
             COUNT(*) as total_count,
             SUM(CASE WHEN type = 'lead' THEN 1 ELSE 0 END) as lead_count,
             SUM(CASE WHEN type = 'opportunity' THEN 1 ELSE 0 END) as opportunity_count,
             SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_count,
             SUM(CASE WHEN status = 'won' THEN expected_revenue ELSE 0 END) as total_revenue"
        )
        ->groupBy('source_name')
        ->orderByDesc('total_count')
        ->get()
        ->map(function ($row) {
            $row->win_rate = $row->total_count > 0
                ? round(($row->won_count / $row->total_count) * 100, 1)
                : 0;
            return $row;
        });

        return Inertia::render('CRM/Reports/Source', [
            'sources' => $sources,
        ]);
    }
}

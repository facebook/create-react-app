<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ForecastController extends ApiController
{
    public function revenue(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $months   = $request->integer('months', 6);
        $months   = min(max($months, 1), 24);

        // Historical monthly revenue from the past 12 months
        $historical = DB::table('invoices')
            ->join('invoice_items', 'invoices.id', '=', 'invoice_items.invoice_id')
            ->where('invoices.tenant_id', $tenantId)
            ->where('invoices.status', 'paid')
            ->where('invoices.created_at', '>=', now()->subYear())
            ->selectRaw("strftime('%Y-%m', invoices.created_at) as month, SUM(invoice_items.quantity * invoice_items.unit_price) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $avgMonthly = $historical->isNotEmpty() ? $historical->avg('revenue') : 0;
        $trend      = $this->calculateTrend($historical->pluck('revenue')->toArray());

        $forecast = [];
        for ($i = 1; $i <= $months; $i++) {
            $date     = now()->addMonths($i);
            $projected = max(0, $avgMonthly + ($trend * $i));
            $forecast[] = [
                'month'    => $date->format('Y-m'),
                'label'    => $date->format('M Y'),
                'projected' => round($projected, 2),
                'lower'    => round($projected * 0.85, 2),
                'upper'    => round($projected * 1.15, 2),
            ];
        }

        return $this->success([
            'historical'     => $historical,
            'avg_monthly'    => round($avgMonthly, 2),
            'trend_per_month' => round($trend, 2),
            'forecast'       => $forecast,
        ]);
    }

    public function cashFlow(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $months   = $request->integer('months', 6);
        $months   = min(max($months, 1), 24);

        // Historical monthly inflows (paid invoices)
        $inflows = DB::table('invoices')
            ->join('invoice_items', 'invoices.id', '=', 'invoice_items.invoice_id')
            ->where('invoices.tenant_id', $tenantId)
            ->where('invoices.status', 'paid')
            ->where('invoices.created_at', '>=', now()->subYear())
            ->selectRaw("strftime('%Y-%m', invoices.created_at) as month, SUM(invoice_items.quantity * invoice_items.unit_price) as amount")
            ->groupBy('month')->orderBy('month')->get()->keyBy('month');

        // Historical monthly outflows (bills)
        $outflows = DB::table('bills')
            ->join('bill_items', 'bills.id', '=', 'bill_items.bill_id')
            ->where('bills.tenant_id', $tenantId)
            ->where('bills.created_at', '>=', now()->subYear())
            ->whereNull('bills.deleted_at')
            ->selectRaw("strftime('%Y-%m', bills.created_at) as month, SUM(bill_items.quantity * bill_items.unit_price) as amount")
            ->groupBy('month')->orderBy('month')->get()->keyBy('month');

        $avgInflow  = $inflows->isNotEmpty() ? $inflows->avg('amount') : 0;
        $avgOutflow = $outflows->isNotEmpty() ? $outflows->avg('amount') : 0;
        $inTrend    = $this->calculateTrend($inflows->pluck('amount')->toArray());
        $outTrend   = $this->calculateTrend($outflows->pluck('amount')->toArray());

        $forecast = [];
        for ($i = 1; $i <= $months; $i++) {
            $date           = now()->addMonths($i);
            $projectedIn    = max(0, $avgInflow + ($inTrend * $i));
            $projectedOut   = max(0, $avgOutflow + ($outTrend * $i));
            $forecast[] = [
                'month'          => $date->format('Y-m'),
                'label'          => $date->format('M Y'),
                'projected_in'   => round($projectedIn, 2),
                'projected_out'  => round($projectedOut, 2),
                'projected_net'  => round($projectedIn - $projectedOut, 2),
            ];
        }

        return $this->success([
            'avg_monthly_inflow'  => round($avgInflow, 2),
            'avg_monthly_outflow' => round($avgOutflow, 2),
            'forecast'            => $forecast,
        ]);
    }

    /**
     * Simple linear regression slope: how much does revenue change per month on average.
     *
     * @param  float[]  $values
     */
    private function calculateTrend(array $values): float
    {
        $n = count($values);
        if ($n < 2) {
            return 0;
        }

        $xBar = ($n - 1) / 2;
        $yBar = array_sum($values) / $n;

        $numerator   = 0;
        $denominator = 0;

        foreach ($values as $x => $y) {
            $numerator   += ($x - $xBar) * ($y - $yBar);
            $denominator += ($x - $xBar) ** 2;
        }

        return $denominator == 0 ? 0 : $numerator / $denominator;
    }
}

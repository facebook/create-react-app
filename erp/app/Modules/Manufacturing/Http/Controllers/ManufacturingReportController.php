<?php

namespace App\Modules\Manufacturing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Manufacturing\Models\BillOfMaterials;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManufacturingReportController extends Controller
{
    public function productionOutput(Request $request): Response
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $orders = ManufacturingOrder::with('product')
            ->where('status', 'done')
            ->whereBetween('finish_date', [$from, $to])
            ->get();

        $byProduct = $orders->groupBy('product_id')->map(function ($group) {
            $first = $group->first();
            return [
                'product_id'       => $first->product_id,
                'product_name'     => $first->product?->name ?? 'Unknown',
                'mo_count'         => $group->count(),
                'total_qty'        => $group->sum('qty_produced'),
                'avg_qty_per_mo'   => round($group->avg('qty_produced'), 4),
            ];
        })->values();

        return Inertia::render('Manufacturing/Reports/ProductionOutput', [
            'rows'      => $byProduct,
            'totalMos'  => $orders->count(),
            'totalQty'  => $orders->sum('qty_produced'),
            'filters'   => compact('from', 'to'),
        ]);
    }

    public function bomCost(Request $request): Response
    {
        $boms = BillOfMaterials::with(['product', 'lines.component'])->get();

        $rows = $boms->map(function (BillOfMaterials $bom) {
            $cost = $bom->lines->sum(
                fn ($line) => (float) ($line->component?->cost_price ?? 0) * $line->quantity
            );
            return [
                'id'              => $bom->id,
                'product_name'    => $bom->product?->name ?? 'Unknown',
                'bom_name'        => $bom->name,
                'component_count' => $bom->lines->count(),
                'estimated_cost'  => round($cost, 4),
            ];
        });

        return Inertia::render('Manufacturing/Reports/BomCost', [
            'rows' => $rows,
        ]);
    }
}

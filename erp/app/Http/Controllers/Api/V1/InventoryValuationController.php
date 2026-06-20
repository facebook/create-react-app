<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Inventory\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryValuationController extends ApiController
{
    public function summary(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $products = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'cost_price']);

        $totalValue = $products->sum(fn ($p) => (float) $p->stock_quantity * (float) $p->cost_price);

        return $this->success([
            'total_value'      => round($totalValue, 2),
            'product_count'    => $products->count(),
            'valuation_method' => 'average_cost',
            'as_of'            => now()->toDateString(),
        ]);
    }

    public function breakdown(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $minValue = (float) $request->get('min_value', 0);

        $products = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'cost_price', 'sale_price']);

        $rows = $products->map(fn ($p) => [
            'product_id'       => $p->id,
            'name'             => $p->name,
            'sku'              => $p->sku,
            'stock_quantity'   => (float) $p->stock_quantity,
            'cost_price'       => (float) $p->cost_price,
            'stock_value'      => round((float) $p->stock_quantity * (float) $p->cost_price, 2),
            'retail_value'     => round((float) $p->stock_quantity * (float) $p->sale_price, 2),
            'potential_margin' => (float) $p->sale_price > 0
                ? round((((float) $p->sale_price - (float) $p->cost_price) / (float) $p->sale_price) * 100, 1)
                : null,
        ])->filter(fn ($row) => $row['stock_value'] >= $minValue)
          ->sortByDesc('stock_value')
          ->values();

        $totalCostValue   = $rows->sum('stock_value');
        $totalRetailValue = $rows->sum('retail_value');

        return $this->success([
            'products'           => $rows,
            'total_cost_value'   => round($totalCostValue, 2),
            'total_retail_value' => round($totalRetailValue, 2),
            'total_potential_margin' => $totalRetailValue > 0
                ? round((($totalRetailValue - $totalCostValue) / $totalRetailValue) * 100, 1)
                : null,
            'count'              => $rows->count(),
        ]);
    }

    public function movement(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $from     = $request->get('from', now()->subMonths(3)->toDateString());
        $to       = $request->get('to', now()->toDateString());

        $movements = DB::table('stock_movements')
            ->where('tenant_id', $tenantId)
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->select([
                'type as movement_type',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(quantity) as total_quantity'),
            ])
            ->groupBy('type')
            ->get();

        return $this->success([
            'period'    => ['from' => $from, 'to' => $to],
            'movements' => $movements,
        ]);
    }

    public function lowValueStock(Request $request): JsonResponse
    {
        $tenantId  = $this->tenantId($request);
        $threshold = (float) $request->get('threshold', 100);

        $products = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'cost_price'])
            ->map(fn ($p) => [
                'product_id'    => $p->id,
                'name'          => $p->name,
                'sku'           => $p->sku,
                'stock_quantity' => (float) $p->stock_quantity,
                'cost_price'    => (float) $p->cost_price,
                'stock_value'   => round((float) $p->stock_quantity * (float) $p->cost_price, 2),
            ])
            ->filter(fn ($r) => $r['stock_value'] <= $threshold)
            ->sortBy('stock_value')
            ->values();

        return $this->success([
            'threshold' => $threshold,
            'products'  => $products,
            'count'     => $products->count(),
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

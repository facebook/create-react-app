<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\WarehouseStock;
use App\Modules\Inventory\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryReportController
{
    public function stockValuation(Request $request): Response
    {
        $tenantId    = auth()->user()->tenant_id;
        $warehouseId = $request->get('warehouse_id');

        $query = WarehouseStock::with(['product', 'warehouse'])
            ->where('tenant_id', $tenantId)
            ->where('quantity', '>', 0);

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $stocks = $query->get();

        $rows = $stocks->map(function ($ws) {
            $unitCost   = (float) ($ws->product->cost_price ?? 0);
            $qty        = (float) $ws->quantity;
            $totalValue = $qty * $unitCost;
            return [
                'product_id'       => $ws->product_id,
                'product_name'     => $ws->product->name ?? '',
                'sku'              => $ws->product->sku ?? '',
                'warehouse_id'     => $ws->warehouse_id,
                'warehouse_name'   => $ws->warehouse->name ?? '',
                'quantity'         => $qty,
                'unit_cost'        => $unitCost,
                'total_value'      => $totalValue,
            ];
        })->sortByDesc('total_value')->values();

        $byWarehouse = $rows->groupBy('warehouse_name')->map(function ($group, $wName) {
            return [
                'warehouse_name' => $wName,
                'product_count'  => $group->count(),
                'total_qty'      => $group->sum('quantity'),
                'total_value'    => $group->sum('total_value'),
            ];
        })->values();

        $summary = [
            'total_products' => $rows->pluck('product_id')->unique()->count(),
            'total_qty'      => $rows->sum('quantity'),
            'total_value'    => $rows->sum('total_value'),
            'by_warehouse'   => $byWarehouse,
        ];

        $warehouses = Warehouse::where('tenant_id', $tenantId)->where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Inventory/Reports/StockValuation', [
            'rows'            => $rows,
            'summary'         => $summary,
            'warehouses'      => $warehouses,
            'filters'         => ['warehouse_id' => $warehouseId],
        ]);
    }

    public function stockMovement(Request $request): Response
    {
        $tenantId    = auth()->user()->tenant_id;
        $dateFrom    = $request->get('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo      = $request->get('date_to', Carbon::today()->toDateString());
        $productId   = $request->get('product_id');
        $warehouseId = $request->get('warehouse_id');

        $query = StockMovement::with(['product', 'warehouse'])
            ->where('tenant_id', $tenantId)
            ->whereBetween(DB::raw('DATE(created_at)'), [$dateFrom, $dateTo]);

        if ($productId) {
            $query->where('product_id', $productId);
        }
        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $movements = $query->orderBy('created_at', 'desc')->get();

        $rows = $movements->map(fn($m) => [
            'id'             => $m->id,
            'product_id'     => $m->product_id,
            'product_name'   => $m->product->name ?? '',
            'sku'            => $m->product->sku ?? '',
            'warehouse_id'   => $m->warehouse_id,
            'warehouse_name' => $m->warehouse->name ?? '',
            'type'           => $m->type,
            'quantity'       => (float) $m->quantity,
            'reference'      => $m->reference ?? '',
            'notes'          => $m->notes ?? '',
            'created_at'     => $m->created_at?->toDateTimeString() ?? '',
        ]);

        $inTypes  = ['in', 'purchase', 'return', 'adjustment_in', 'transfer_in', 'receipt'];
        $outTypes = ['out', 'sale', 'adjustment_out', 'transfer_out', 'issue'];

        $totalIn  = $rows->filter(fn($r) => in_array($r['type'], $inTypes))->sum('quantity');
        $totalOut = $rows->filter(fn($r) => in_array($r['type'], $outTypes))->sum('quantity');

        $summary = [
            'total_movements' => $rows->count(),
            'total_in'        => $totalIn,
            'total_out'       => $totalOut,
            'net_change'      => $totalIn - $totalOut,
        ];

        $products   = Product::where('tenant_id', $tenantId)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']);
        $warehouses = Warehouse::where('tenant_id', $tenantId)->where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Inventory/Reports/StockMovement', [
            'rows'       => $rows->values(),
            'summary'    => $summary,
            'products'   => $products,
            'warehouses' => $warehouses,
            'filters'    => ['date_from' => $dateFrom, 'date_to' => $dateTo, 'product_id' => $productId, 'warehouse_id' => $warehouseId],
        ]);
    }

    public function lowStock(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        // Get products with their reorder_point and actual stock via WarehouseStock
        $stocks = WarehouseStock::with(['product'])
            ->where('tenant_id', $tenantId)
            ->whereNotNull('reorder_point')
            ->get();

        // Also check product-level reorder_point for products without warehouse-level setting
        $productReorderMap = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNotNull('reorder_point')
            ->get(['id', 'name', 'sku', 'reorder_point'])
            ->keyBy('id');

        // Aggregate stock by product across warehouses
        $stockByProduct = $stocks->groupBy('product_id')->map(fn($group) => [
            'total_qty'     => $group->sum('quantity'),
            'reorder_point' => $group->max('reorder_point'), // warehouse-level
            'product'       => $group->first()->product,
        ]);

        $rows = collect();

        foreach ($productReorderMap as $productId => $product) {
            $stockInfo   = $stockByProduct->get($productId);
            $currentQty  = $stockInfo ? (float) $stockInfo['total_qty'] : 0;
            $minLevel    = $stockInfo ? (float) $stockInfo['reorder_point'] : (float) $product->reorder_point;

            if ($minLevel <= 0) {
                $minLevel = (float) $product->reorder_point;
            }

            if ($currentQty <= $minLevel) {
                $rows->push([
                    'product_id'    => $product->id,
                    'product_name'  => $product->name,
                    'sku'           => $product->sku,
                    'current_stock' => $currentQty,
                    'min_level'     => $minLevel,
                    'shortage'      => max(0, $minLevel - $currentQty),
                ]);
            }
        }

        $rows = $rows->sortByDesc('shortage')->values();

        return Inertia::render('Inventory/Reports/LowStock', [
            'rows'    => $rows,
            'summary' => ['products_at_risk' => $rows->count()],
        ]);
    }

    public function abcAnalysis(Request $request): Response
    {
        $tenantId  = auth()->user()->tenant_id;
        $since     = Carbon::now()->subDays(90)->startOfDay();
        $outTypes  = ['out', 'sale', 'adjustment_out', 'transfer_out', 'issue'];

        $movements = StockMovement::with(['product'])
            ->where('tenant_id', $tenantId)
            ->where('created_at', '>=', $since)
            ->whereIn('type', $outTypes)
            ->get();

        // Group by product, sum qty * cost
        $grouped = $movements->groupBy('product_id')->map(function ($group) {
            $product = $group->first()->product;
            $value   = $group->sum(fn($m) => abs((float) $m->quantity) * (float) ($product->cost_price ?? 0));
            return [
                'product_id'   => $group->first()->product_id,
                'product_name' => $product->name ?? '',
                'sku'          => $product->sku ?? '',
                'movement_value' => $value,
            ];
        })->sortByDesc('movement_value')->values();

        $totalValue = $grouped->sum('movement_value');
        $cumulative = 0;
        $rows = $grouped->map(function ($row, $index) use ($totalValue, &$cumulative) {
            $pct        = $totalValue > 0 ? ($row['movement_value'] / $totalValue * 100) : 0;
            $cumulative += $pct;
            $bucket     = $cumulative <= 80 ? 'A' : ($cumulative <= 95 ? 'B' : 'C');
            return array_merge($row, [
                'rank'        => $index + 1,
                'percentage'  => round($pct, 2),
                'cumulative'  => round($cumulative, 2),
                'bucket'      => $bucket,
            ]);
        });

        $bucketSummary = [
            'A' => $rows->where('bucket', 'A')->count(),
            'B' => $rows->where('bucket', 'B')->count(),
            'C' => $rows->where('bucket', 'C')->count(),
        ];

        return Inertia::render('Inventory/Reports/AbcAnalysis', [
            'rows'          => $rows->values(),
            'total_value'   => $totalValue,
            'bucket_summary' => $bucketSummary,
        ]);
    }
}

<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\PurchaseOrder;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\Supplier;
use Inertia\Inertia;
use Inertia\Response;

class InventoryDashboardController extends Controller
{
    public function index(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $totalProducts  = Product::where('tenant_id', $tenantId)->count();
        $lowStockCount  = Product::where('tenant_id', $tenantId)->with('stockLevels')
            ->get()->filter(fn($p) => $p->stockLevels->sum('quantity') < $p->reorder_point)->count();
        $outOfStockCount = Product::where('tenant_id', $tenantId)->with('stockLevels')
            ->get()->filter(fn($p) => $p->stockLevels->sum('quantity') <= 0)->count();
        $pendingPoCount = PurchaseOrder::where('tenant_id', $tenantId)
            ->whereIn('status', ['draft', 'submitted', 'approved'])->count();
        $totalWarehouses = Warehouse::where('tenant_id', $tenantId)->count();
        $activeSuppliers = Supplier::where('tenant_id', $tenantId)->where('is_active', true)->count();

        $lowStockItems = Product::where('tenant_id', $tenantId)
            ->with('stockLevels')
            ->get()
            ->map(fn($p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'sku'           => $p->sku,
                'quantity'      => round($p->stockLevels->sum('quantity'), 2),
                'reorder_point' => $p->reorder_point,
            ])
            ->filter(fn($p) => $p['quantity'] < $p['reorder_point'])
            ->sortBy('quantity')
            ->take(10)
            ->values();

        $recentPos = PurchaseOrder::where('tenant_id', $tenantId)
            ->with('supplier')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($po) => [
                'id'         => $po->id,
                'status'     => $po->status,
                'supplier'   => $po->supplier?->name,
                'created_at' => $po->created_at?->format('M d, Y'),
            ]);

        $movements7d = StockMovement::where('tenant_id', $tenantId)
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, type, SUM(quantity) as total')
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get();

        return Inertia::render('Inventory/Dashboard', compact(
            'totalProducts', 'lowStockCount', 'outOfStockCount', 'pendingPoCount',
            'totalWarehouses', 'activeSuppliers', 'lowStockItems', 'recentPos', 'movements7d'
        ));
    }
}

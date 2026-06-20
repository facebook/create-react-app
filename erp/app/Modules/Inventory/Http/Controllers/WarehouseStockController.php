<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseStock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseStockController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', WarehouseStock::class);

        $query = WarehouseStock::with(['product', 'warehouse']);

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->input('warehouse_id'));
        }

        $stocks     = $query->orderBy('warehouse_id')->orderBy('product_id')->paginate(20)->withQueryString();
        $warehouses = Warehouse::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Inventory/WarehouseStock/Index', [
            'stocks'       => $stocks,
            'warehouses'   => $warehouses,
            'warehouse_id' => $request->input('warehouse_id'),
        ]);
    }

    public function show(WarehouseStock $warehouseStock): Response
    {
        $this->authorize('view', $warehouseStock);
        $warehouseStock->load(['product', 'warehouse']);

        return Inertia::render('Inventory/WarehouseStock/Show', compact('warehouseStock'));
    }

    public function update(Request $request, WarehouseStock $warehouseStock): RedirectResponse
    {
        $this->authorize('update', $warehouseStock);

        $data = $request->validate([
            'reorder_point' => ['nullable', 'numeric', 'min:0'],
        ]);

        $warehouseStock->update(['reorder_point' => $data['reorder_point']]);

        return back()->with('success', 'Reorder point updated.');
    }
}

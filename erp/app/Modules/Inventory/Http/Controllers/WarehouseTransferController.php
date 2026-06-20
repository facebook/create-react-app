<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseTransfer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseTransferController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', WarehouseTransfer::class);
        $tenantId  = $request->user()->tenant_id;
        $transfers = WarehouseTransfer::where('tenant_id', $tenantId)
            ->with(['product', 'fromWarehouse', 'toWarehouse'])
            ->latest()
            ->paginate(50);
        return Inertia::render('Inventory/WarehouseTransfers/Index', ['transfers' => $transfers]);
    }

    public function create(Request $request)
    {
        $this->authorize('create', WarehouseTransfer::class);
        $tenantId   = $request->user()->tenant_id;
        $products   = Product::where('tenant_id', $tenantId)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']);
        $warehouses = Warehouse::where('tenant_id', $tenantId)->orderBy('name')->get(['id', 'name']);
        return Inertia::render('Inventory/WarehouseTransfers/Create', compact('products', 'warehouses'));
    }

    public function store(Request $request)
    {
        $this->authorize('create', WarehouseTransfer::class);

        $data = $request->validate([
            'product_id'        => 'required|exists:products,id',
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id'   => 'required|exists:warehouses,id|different:from_warehouse_id',
            'quantity'          => 'required|numeric|min:0.0001',
            'reference'         => 'nullable|string|max:100',
            'notes'             => 'nullable|string|max:500',
        ]);

        $data['tenant_id'] = $request->user()->tenant_id;

        // Bind tenant so StockMovement::record() can resolve tenant_id for stock levels
        if (!app()->has('tenant')) {
            $tenant = \App\Modules\Core\Models\Tenant::find($data['tenant_id']);
            if ($tenant) {
                app()->instance('tenant', $tenant);
            }
        }

        try {
            WarehouseTransfer::execute($data);
        } catch (\DomainException $e) {
            return back()->withErrors(['quantity' => $e->getMessage()]);
        }

        return redirect('/inventory/warehouse-transfers')->with('success', 'Transfer completed.');
    }
}

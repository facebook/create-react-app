<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function index(Request $request): Response
    {
        $movements = StockMovement::with(['product', 'warehouse', 'creator'])
            ->when($request->product_id, fn ($q) => $q->where('product_id', $request->product_id))
            ->when($request->warehouse_id, fn ($q) => $q->where('warehouse_id', $request->warehouse_id))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->latest('created_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Inventory/StockMovements/Index', [
            'movements'   => $movements,
            'products'    => Product::active()->orderBy('name')->get(['id', 'name', 'sku']),
            'warehouses'  => Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters'     => $request->only(['product_id', 'warehouse_id', 'type', 'date_from', 'date_to']),
            'breadcrumbs' => [
                ['label' => 'Inventory'],
                ['label' => 'Stock Movements', 'href' => route('inventory.stock-movements.index')],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id'   => ['required', 'integer', 'exists:products,id'],
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'type'         => ['required', 'in:in,out,adjustment'],
            'quantity'     => ['required', 'numeric', 'min:0.01'],
            'reference'    => ['nullable', 'string', 'max:255'],
            'notes'        => ['nullable', 'string'],
        ]);

        try {
            StockMovement::record($validated);
        } catch (\DomainException $e) {
            return back()->withErrors(['quantity' => $e->getMessage()]);
        }

        return back()->with('success', 'Stock movement recorded.');
    }
}

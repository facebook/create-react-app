<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockTransfer;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', StockTransfer::class);

        $transfers = StockTransfer::with(['fromWarehouse', 'toWarehouse'])
            ->withCount('items')
            ->orderByDesc('created_at')
            ->paginate(15);

        return Inertia::render('Inventory/StockTransfers/Index', compact('transfers'));
    }

    public function create(): Response
    {
        $this->authorize('create', StockTransfer::class);

        $warehouses = Warehouse::orderBy('name')->get(['id', 'name']);
        $products   = Product::orderBy('name')->get(['id', 'name', 'sku']);

        return Inertia::render('Inventory/StockTransfers/Create', compact('warehouses', 'products'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', StockTransfer::class);

        $data = $request->validate([
            'from_warehouse_id'   => ['required', Rule::exists('warehouses', 'id')],
            'to_warehouse_id'     => ['required', Rule::exists('warehouses', 'id'), 'different:from_warehouse_id'],
            'notes'               => ['nullable', 'string'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.product_id'  => ['required', Rule::exists('products', 'id')],
            'items.*.quantity'    => ['required', 'numeric', 'min:0.0001'],
        ]);

        $transfer = StockTransfer::create([
            'tenant_id'         => auth()->user()->tenant_id,
            'from_warehouse_id' => $data['from_warehouse_id'],
            'to_warehouse_id'   => $data['to_warehouse_id'],
            'status'            => 'draft',
            'notes'             => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            $transfer->items()->create([
                'tenant_id'  => auth()->user()->tenant_id,
                'product_id' => $item['product_id'],
                'quantity'   => $item['quantity'],
            ]);
        }

        return redirect()->route('inventory.stock-transfers.show', $transfer)
            ->with('success', 'Stock transfer created.');
    }

    public function show(StockTransfer $stockTransfer): Response
    {
        $this->authorize('view', $stockTransfer);
        $stockTransfer->load(['fromWarehouse', 'toWarehouse', 'items.product']);

        return Inertia::render('Inventory/StockTransfers/Show', compact('stockTransfer'));
    }

    public function destroy(StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('delete', $stockTransfer);
        abort_unless($stockTransfer->status === 'draft', 422, 'Only draft transfers can be deleted.');
        $stockTransfer->delete();

        return redirect()->route('inventory.stock-transfers.index')
            ->with('success', 'Transfer deleted.');
    }

    public function complete(StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('update', $stockTransfer);
        $stockTransfer->complete();

        return back()->with('success', 'Transfer completed and stock updated.');
    }

    public function cancel(StockTransfer $stockTransfer): RedirectResponse
    {
        $this->authorize('update', $stockTransfer);
        $stockTransfer->cancel();

        return back()->with('success', 'Transfer cancelled.');
    }
}

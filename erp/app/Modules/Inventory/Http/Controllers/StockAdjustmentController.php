<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockAdjustment;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', StockAdjustment::class);
        $adjustments = StockAdjustment::with(['warehouse', 'adjuster'])
            ->orderByDesc('created_at')
            ->paginate(25);
        return Inertia::render('Inventory/StockAdjustments/Index', compact('adjustments'));
    }

    public function create(): Response
    {
        $this->authorize('create', StockAdjustment::class);
        $warehouses = Warehouse::orderBy('name')->get(['id', 'name']);
        $products   = Product::orderBy('name')->get(['id', 'name', 'sku']);
        return Inertia::render('Inventory/StockAdjustments/Create', compact('warehouses', 'products'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', StockAdjustment::class);
        $data = $request->validate([
            'warehouse_id'                  => 'required|exists:warehouses,id',
            'reference'                     => 'required|string|max:100|unique:stock_adjustments,reference',
            'reason'                        => 'required|in:count,damage,theft,expiry,correction,other',
            'notes'                         => 'nullable|string',
            'items'                         => 'required|array|min:1',
            'items.*.product_id'            => 'required|exists:products,id',
            'items.*.expected_quantity'     => 'required|numeric|min:0',
            'items.*.actual_quantity'       => 'required|numeric|min:0',
        ]);

        $adj = StockAdjustment::create([
            'tenant_id'    => auth()->user()->tenant_id,
            'warehouse_id' => $data['warehouse_id'],
            'reference'    => $data['reference'],
            'reason'       => $data['reason'],
            'status'       => 'draft',
            'notes'        => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            $adj->items()->create([
                'product_id'        => $item['product_id'],
                'expected_quantity' => $item['expected_quantity'],
                'actual_quantity'   => $item['actual_quantity'],
                'difference'        => $item['actual_quantity'] - $item['expected_quantity'],
            ]);
        }

        return redirect()->route('inventory.stock-adjustments.show', $adj)
            ->with('success', 'Stock adjustment created.');
    }

    public function show(StockAdjustment $stockAdjustment): Response
    {
        $this->authorize('view', $stockAdjustment);
        $stockAdjustment->load(['warehouse', 'adjuster', 'items.product']);
        return Inertia::render('Inventory/StockAdjustments/Show', compact('stockAdjustment'));
    }

    public function confirm(StockAdjustment $stockAdjustment): RedirectResponse
    {
        $this->authorize('update', $stockAdjustment);
        /** @var User $user */
        $user = auth()->user();
        $stockAdjustment->confirm($user);
        return back()->with('success', 'Adjustment confirmed and stock updated.');
    }

    public function cancel(StockAdjustment $stockAdjustment): RedirectResponse
    {
        $this->authorize('update', $stockAdjustment);
        abort_unless($stockAdjustment->status === 'draft', 422, 'Only draft adjustments can be cancelled.');
        $stockAdjustment->update(['status' => 'cancelled']);
        return back()->with('success', 'Adjustment cancelled.');
    }

    public function destroy(StockAdjustment $stockAdjustment): RedirectResponse
    {
        $this->authorize('delete', $stockAdjustment);
        abort_unless($stockAdjustment->status === 'draft', 422, 'Only draft adjustments can be deleted.');
        $stockAdjustment->delete();
        return redirect()->route('inventory.stock-adjustments.index')->with('success', 'Adjustment deleted.');
    }
}

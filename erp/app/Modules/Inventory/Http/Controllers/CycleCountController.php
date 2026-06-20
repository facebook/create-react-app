<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\CycleCount;
use App\Modules\Inventory\Models\CycleCountItem;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CycleCountController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CycleCount::class);

        $query = CycleCount::with('warehouse')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $cycleCounts = $query->paginate(20);

        return Inertia::render('Inventory/CycleCounts/Index', compact('cycleCounts'));
    }

    public function create(): Response
    {
        $this->authorize('create', CycleCount::class);

        $warehouses = Warehouse::orderBy('name')->get(['id', 'name']);
        $products   = Product::orderBy('name')->get(['id', 'name', 'sku']);

        return Inertia::render('Inventory/CycleCounts/Create', compact('warehouses', 'products'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CycleCount::class);

        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'count_date'   => 'required|date',
            'notes'        => 'nullable|string',
            'products'     => 'required|array|min:1',
            'products.*'   => 'exists:products,id',
        ]);

        $cc = CycleCount::create([
            'tenant_id'    => auth()->user()->tenant_id,
            'warehouse_id' => $validated['warehouse_id'],
            'count_number' => CycleCount::generateCountNumber(),
            'count_date'   => $validated['count_date'],
            'notes'        => $validated['notes'] ?? null,
            'created_by'   => auth()->id(),
        ]);

        foreach ($validated['products'] as $productId) {
            $stockLevel = StockLevel::where('product_id', $productId)
                ->where('warehouse_id', $validated['warehouse_id'])
                ->first();

            CycleCountItem::create([
                'tenant_id'      => auth()->user()->tenant_id,
                'cycle_count_id' => $cc->id,
                'product_id'     => $productId,
                'system_qty'     => $stockLevel?->quantity ?? 0,
            ]);
        }

        return redirect()->route('inventory.cycle-counts.show', $cc)
            ->with('success', 'Cycle count created.');
    }

    public function show(CycleCount $cycleCount): Response
    {
        $this->authorize('view', $cycleCount);

        $cycleCount->load(['warehouse', 'items.product']);

        return Inertia::render('Inventory/CycleCounts/Show', compact('cycleCount'));
    }

    public function updateCounts(Request $request, CycleCount $cycleCount): RedirectResponse
    {
        $this->authorize('update', $cycleCount);

        $validated = $request->validate([
            'items'               => 'required|array',
            'items.*.id'          => 'required|exists:cycle_count_items,id',
            'items.*.counted_qty' => 'required|numeric|min:0',
        ]);

        foreach ($validated['items'] as $itemData) {
            $item = CycleCountItem::find($itemData['id']);
            if ($item && $item->cycle_count_id === $cycleCount->id) {
                $item->counted_qty = $itemData['counted_qty'];
                $item->save();
            }
        }

        return back()->with('success', 'Counts updated.');
    }

    public function start(CycleCount $cycleCount): RedirectResponse
    {
        $this->authorize('update', $cycleCount);

        $cycleCount->start();

        return back()->with('success', 'Cycle count started.');
    }

    public function complete(CycleCount $cycleCount): RedirectResponse
    {
        $this->authorize('update', $cycleCount);

        $cycleCount->complete();

        return back()->with('success', 'Cycle count completed.');
    }

    public function cancel(CycleCount $cycleCount): RedirectResponse
    {
        $this->authorize('update', $cycleCount);

        $cycleCount->cancel();

        return back()->with('success', 'Cycle count cancelled.');
    }

    public function destroy(CycleCount $cycleCount): RedirectResponse
    {
        $this->authorize('delete', $cycleCount);

        $cycleCount->delete();

        return redirect()->route('inventory.cycle-counts.index')
            ->with('success', 'Cycle count deleted.');
    }
}

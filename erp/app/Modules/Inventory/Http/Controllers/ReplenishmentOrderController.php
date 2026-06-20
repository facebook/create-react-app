<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ReplenishmentOrder;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReplenishmentOrderController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', ReplenishmentOrder::class);

        $replenishments = ReplenishmentOrder::with(['product', 'warehouse', 'supplier'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Inventory/Replenishments/Index', compact('replenishments'));
    }

    public function create(): Response
    {
        $this->authorize('create', ReplenishmentOrder::class);

        $products   = Product::orderBy('name')->get(['id', 'name', 'sku']);
        $warehouses = Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $suppliers  = Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Inventory/Replenishments/Create', compact('products', 'warehouses', 'suppliers'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ReplenishmentOrder::class);

        $data = $request->validate([
            'product_id'     => 'required|exists:products,id',
            'warehouse_id'   => 'required|exists:warehouses,id',
            'qty_needed'     => 'required|numeric|min:0.01',
            'qty_to_order'   => 'required|numeric|min:0.01',
            'route'          => 'required|in:buy,manufacture,resupply',
            'scheduled_date' => 'nullable|date',
            'supplier_id'    => 'nullable|exists:suppliers,id',
            'notes'          => 'nullable|string',
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        ReplenishmentOrder::create($data);

        return redirect()->route('inventory.replenishments.index');
    }

    public function show(ReplenishmentOrder $replenishment): Response
    {
        $this->authorize('view', $replenishment);

        $replenishment->load(['product', 'warehouse', 'supplier']);

        return Inertia::render('Inventory/Replenishments/Show', compact('replenishment'));
    }

    public function destroy(ReplenishmentOrder $replenishment): RedirectResponse
    {
        $this->authorize('delete', $replenishment);

        $replenishment->delete();

        return redirect()->route('inventory.replenishments.index');
    }

    public function confirm(ReplenishmentOrder $replenishment): RedirectResponse
    {
        $this->authorize('confirm', $replenishment);

        $replenishment->confirm();

        return redirect()->route('inventory.replenishments.index');
    }

    public function markInProgress(ReplenishmentOrder $replenishment): RedirectResponse
    {
        $this->authorize('markInProgress', $replenishment);

        $replenishment->markInProgress();

        return redirect()->route('inventory.replenishments.index');
    }

    public function complete(ReplenishmentOrder $replenishment): RedirectResponse
    {
        $this->authorize('complete', $replenishment);

        $replenishment->complete();

        return redirect()->route('inventory.replenishments.index');
    }

    public function cancel(ReplenishmentOrder $replenishment): RedirectResponse
    {
        $this->authorize('cancel', $replenishment);

        $replenishment->cancel();

        return redirect()->route('inventory.replenishments.index');
    }
}

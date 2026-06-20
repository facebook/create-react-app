<?php

namespace App\Modules\Manufacturing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Manufacturing\Models\BillOfMaterials;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManufacturingOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ManufacturingOrder::class);

        $orders = ManufacturingOrder::with(['product', 'bom'])
            ->when($request->search, fn ($q) => $q->where('mo_number', 'like', "%{$request->search}%"))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Manufacturing/ManufacturingOrders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ManufacturingOrder::class);

        return Inertia::render('Manufacturing/ManufacturingOrders/Create', [
            'products'   => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'boms'       => BillOfMaterials::where('is_active', true)->with('product')->orderBy('name')->get(['id', 'name', 'product_id', 'type']),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'users'      => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ManufacturingOrder::class);

        $validated = $request->validate([
            'product_id'      => 'required|exists:products,id',
            'bom_id'          => 'nullable|exists:bills_of_materials,id',
            'qty_to_produce'  => 'required|numeric|min:0.0001',
            'scheduled_date'  => 'nullable|date',
            'warehouse_id'    => 'nullable|exists:warehouses,id',
            'origin'          => 'nullable|string|max:255',
            'notes'           => 'nullable|string',
            'responsible_id'  => 'nullable|exists:users,id',
        ]);

        $mo = ManufacturingOrder::create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        // Auto-populate components from BOM lines if bom_id provided
        if ($validated['bom_id'] ?? null) {
            $bom         = BillOfMaterials::with('lines')->find($validated['bom_id']);
            $scaleFactor = $validated['qty_to_produce'] / max($bom->qty_per_bom, 1);

            foreach ($bom->lines as $line) {
                $mo->components()->create([
                    'product_id'   => $line->component_id,
                    'qty_required' => $line->quantity * $scaleFactor,
                    'uom'          => $line->uom,
                ]);
            }
        }

        return redirect()->route('manufacturing.manufacturing-orders.index')
            ->with('success', 'Manufacturing Order created successfully.');
    }

    public function show(ManufacturingOrder $manufacturingOrder): Response
    {
        $this->authorize('view', $manufacturingOrder);

        $manufacturingOrder->load([
            'product', 'bom', 'components.product',
            'workOrders.workCenter', 'warehouse', 'responsible',
        ]);

        return Inertia::render('Manufacturing/ManufacturingOrders/Show', [
            'order' => $manufacturingOrder,
        ]);
    }

    public function edit(ManufacturingOrder $manufacturingOrder): Response
    {
        $this->authorize('update', $manufacturingOrder);

        $manufacturingOrder->load(['product', 'bom', 'components.product']);

        return Inertia::render('Manufacturing/ManufacturingOrders/Edit', [
            'order'      => $manufacturingOrder,
            'products'   => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'boms'       => BillOfMaterials::where('is_active', true)->with('product')->orderBy('name')->get(['id', 'name', 'product_id', 'type']),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'users'      => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, ManufacturingOrder $manufacturingOrder): RedirectResponse
    {
        $this->authorize('update', $manufacturingOrder);

        $validated = $request->validate([
            'product_id'      => 'required|exists:products,id',
            'bom_id'          => 'nullable|exists:bills_of_materials,id',
            'qty_to_produce'  => 'required|numeric|min:0.0001',
            'scheduled_date'  => 'nullable|date',
            'warehouse_id'    => 'nullable|exists:warehouses,id',
            'origin'          => 'nullable|string|max:255',
            'notes'           => 'nullable|string',
            'responsible_id'  => 'nullable|exists:users,id',
        ]);

        $manufacturingOrder->update($validated);

        return redirect()->route('manufacturing.manufacturing-orders.show', $manufacturingOrder)
            ->with('success', 'Manufacturing Order updated successfully.');
    }

    public function destroy(ManufacturingOrder $manufacturingOrder): RedirectResponse
    {
        $this->authorize('delete', $manufacturingOrder);

        $manufacturingOrder->delete();

        return redirect()->route('manufacturing.manufacturing-orders.index')
            ->with('success', 'Manufacturing Order deleted successfully.');
    }

    public function confirm(ManufacturingOrder $manufacturingOrder): RedirectResponse
    {
        $this->authorize('confirm', $manufacturingOrder);

        $manufacturingOrder->confirm();

        return redirect()->back()->with('success', 'Manufacturing Order confirmed.');
    }

    public function start(ManufacturingOrder $manufacturingOrder): RedirectResponse
    {
        $this->authorize('startProduction', $manufacturingOrder);

        $manufacturingOrder->startProduction();

        return redirect()->back()->with('success', 'Production started.');
    }

    public function complete(ManufacturingOrder $manufacturingOrder): RedirectResponse
    {
        $this->authorize('complete', $manufacturingOrder);

        $manufacturingOrder->complete();

        return redirect()->back()->with('success', 'Manufacturing Order completed.');
    }

    public function cancel(ManufacturingOrder $manufacturingOrder): RedirectResponse
    {
        $this->authorize('cancel', $manufacturingOrder);

        $manufacturingOrder->cancel();

        return redirect()->back()->with('success', 'Manufacturing Order cancelled.');
    }
}

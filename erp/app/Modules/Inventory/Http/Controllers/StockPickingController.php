<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\StockPicking;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockPickingController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', StockPicking::class);

        $stockPickings = StockPicking::with('warehouse')
            ->withCount('lines')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Inventory/StockPickings/Index', compact('stockPickings'));
    }

    public function create(): Response
    {
        $this->authorize('create', StockPicking::class);

        $warehouses = Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $zones      = WarehouseZone::orderBy('name')->get(['id', 'name', 'warehouse_id']);

        return Inertia::render('Inventory/StockPickings/Create', compact('warehouses', 'zones'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', StockPicking::class);

        $data = $request->validate([
            'picking_type'   => 'required|in:incoming,outgoing,internal,return',
            'warehouse_id'   => 'nullable|exists:warehouses,id',
            'origin'         => 'nullable|string|max:255',
            'partner_name'   => 'nullable|string|max:255',
            'scheduled_date' => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        StockPicking::create($data);

        return redirect()->route('inventory.stock-pickings.index');
    }

    public function show(StockPicking $stockPicking): Response
    {
        $this->authorize('view', $stockPicking);

        $stockPicking->load([
            'lines.product',
            'lines.lot',
            'lines.serial',
            'warehouse',
        ]);

        return Inertia::render('Inventory/StockPickings/Show', compact('stockPicking'));
    }

    public function edit(StockPicking $stockPicking): Response
    {
        $this->authorize('update', $stockPicking);

        $warehouses = Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $zones      = WarehouseZone::orderBy('name')->get(['id', 'name', 'warehouse_id']);

        return Inertia::render('Inventory/StockPickings/Edit', compact('stockPicking', 'warehouses', 'zones'));
    }

    public function update(Request $request, StockPicking $stockPicking): RedirectResponse
    {
        $this->authorize('update', $stockPicking);

        $data = $request->validate([
            'picking_type'   => 'required|in:incoming,outgoing,internal,return',
            'warehouse_id'   => 'nullable|exists:warehouses,id',
            'origin'         => 'nullable|string|max:255',
            'partner_name'   => 'nullable|string|max:255',
            'scheduled_date' => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $stockPicking->update($data);

        return redirect()->route('inventory.stock-pickings.index');
    }

    public function destroy(StockPicking $stockPicking): RedirectResponse
    {
        $this->authorize('delete', $stockPicking);

        $stockPicking->delete();

        return redirect()->route('inventory.stock-pickings.index');
    }

    public function confirm(StockPicking $stockPicking): RedirectResponse
    {
        $this->authorize('confirm', $stockPicking);

        $stockPicking->confirm();

        return redirect()->route('inventory.stock-pickings.index');
    }

    public function startProcessing(StockPicking $stockPicking): RedirectResponse
    {
        $this->authorize('confirm', $stockPicking);

        $stockPicking->startProcessing();

        return redirect()->route('inventory.stock-pickings.index');
    }

    public function validate(StockPicking $stockPicking): RedirectResponse
    {
        $this->authorize('validate', $stockPicking);

        $stockPicking->validate(auth()->id());

        return redirect()->route('inventory.stock-pickings.index');
    }

    public function cancel(StockPicking $stockPicking): RedirectResponse
    {
        $this->authorize('cancel', $stockPicking);

        $stockPicking->cancel();

        return redirect()->route('inventory.stock-pickings.index');
    }
}

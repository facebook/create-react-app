<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\BinStockLocation;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseBin;
use App\Modules\Inventory\Models\WarehouseZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseBinController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', WarehouseBin::class);

        $query = WarehouseBin::with(['zone', 'warehouse']);

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->input('warehouse_id'));
        }

        $bins = $query->orderBy('code')->paginate(20)->withQueryString();

        return Inertia::render('Inventory/WarehouseBins/Index', [
            'bins'    => $bins,
            'filters' => $request->only('warehouse_id'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', WarehouseBin::class);

        $warehouses = Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $zones      = WarehouseZone::where('is_active', true)->orderBy('name')->get(['id', 'warehouse_id', 'name', 'code']);

        return Inertia::render('Inventory/WarehouseBins/Create', compact('warehouses', 'zones'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', WarehouseBin::class);

        $data = $request->validate([
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'zone_id'      => ['nullable', 'exists:warehouse_zones,id'],
            'code'         => ['required', 'string', 'max:30'],
            'name'         => ['nullable', 'string'],
            'bin_type'     => ['required', 'in:standard,cold,hazmat,oversize'],
            'capacity'     => ['nullable', 'numeric', 'min:0'],
            'is_active'    => ['boolean'],
        ]);

        $data['tenant_id'] = app('tenant')->id;

        $bin = WarehouseBin::create($data);

        return redirect()->route('inventory.warehouse-bins.show', $bin);
    }

    public function show(WarehouseBin $warehouseBin): Response
    {
        $this->authorize('view', $warehouseBin);

        $warehouseBin->load(['stockLocations.product', 'zone', 'warehouse']);
        $warehouseBin->append(['used_capacity', 'available_capacity']);

        return Inertia::render('Inventory/WarehouseBins/Show', [
            'bin' => $warehouseBin,
        ]);
    }

    public function destroy(WarehouseBin $warehouseBin): RedirectResponse
    {
        $this->authorize('delete', $warehouseBin);

        $warehouseBin->delete();

        return redirect()->route('inventory.warehouse-bins.index');
    }

    public function addStock(Request $request, WarehouseBin $warehouseBin): RedirectResponse
    {
        $this->authorize('create', $warehouseBin);

        $data = $request->validate([
            'product_id'  => ['required', 'exists:products,id'],
            'quantity'    => ['required', 'numeric', 'min:0.0001'],
            'lot_number'  => ['nullable', 'string', 'max:50'],
            'expiry_date' => ['nullable', 'date'],
        ]);

        $location = BinStockLocation::where('bin_id', $warehouseBin->id)
            ->where('product_id', $data['product_id'])
            ->where('lot_number', $data['lot_number'] ?? null)
            ->first();

        if ($location) {
            $location->increment('quantity', $data['quantity']);
        } else {
            BinStockLocation::create([
                'tenant_id'   => app('tenant')->id,
                'bin_id'      => $warehouseBin->id,
                'product_id'  => $data['product_id'],
                'quantity'    => $data['quantity'],
                'lot_number'  => $data['lot_number'] ?? null,
                'expiry_date' => $data['expiry_date'] ?? null,
            ]);
        }

        return back()->with('success', 'Stock added successfully.');
    }

    public function removeStock(WarehouseBin $warehouseBin, BinStockLocation $location): RedirectResponse
    {
        $this->authorize('delete', $warehouseBin);

        $location->delete();

        return back();
    }
}

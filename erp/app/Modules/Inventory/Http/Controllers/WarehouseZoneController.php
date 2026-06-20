<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseBin;
use App\Modules\Inventory\Models\WarehouseZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseZoneController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', WarehouseBin::class);

        $query = WarehouseZone::with('warehouse')->withCount('bins');

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->input('warehouse_id'));
        }

        $zones      = $query->orderBy('name')->paginate(20)->withQueryString();
        $warehouses = Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Inventory/WarehouseZones/Index', [
            'zones'      => $zones,
            'filters'    => $request->only('warehouse_id'),
            'warehouses' => $warehouses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', WarehouseBin::class);

        $data = $request->validate([
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'name'         => ['required', 'string'],
            'code'         => ['required', 'string', 'max:20'],
        ]);

        $data['tenant_id'] = app('tenant')->id;

        WarehouseZone::create($data);

        return back()->with('success', 'Zone created successfully.');
    }

    public function destroy(WarehouseZone $warehouseZone): RedirectResponse
    {
        $this->authorize('delete', WarehouseBin::class);

        $warehouseZone->delete();

        return back();
    }
}

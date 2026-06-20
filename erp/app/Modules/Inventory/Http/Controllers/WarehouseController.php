<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    public function index(): Response
    {
        $warehouses = Warehouse::withCount('stockLevels')
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/Warehouses/Index', [
            'warehouses'  => $warehouses,
            'breadcrumbs' => [
                ['label' => 'Inventory'],
                ['label' => 'Warehouses', 'href' => route('inventory.warehouses.index')],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'location'  => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        Warehouse::create([...$validated, 'tenant_id' => auth()->user()->tenant_id]);

        return back()->with('success', 'Warehouse created.');
    }

    public function update(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'location'  => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $warehouse->update($validated);

        return back()->with('success', 'Warehouse updated.');
    }

    public function destroy(Warehouse $warehouse): RedirectResponse
    {
        $warehouse->delete();

        return back()->with('success', 'Warehouse deleted.');
    }
}

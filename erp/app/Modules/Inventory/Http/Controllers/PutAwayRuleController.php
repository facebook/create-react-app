<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\PutAwayRule;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseBin;
use App\Modules\Inventory\Models\WarehouseZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PutAwayRuleController
{
    public function index(): Response
    {
        $putAwayRules = PutAwayRule::with('warehouse', 'product', 'category', 'locationOutBin', 'locationOutZone')
            ->orderBy('sequence')
            ->paginate(20);

        return Inertia::render('Inventory/PutAwayRules/Index', compact('putAwayRules'));
    }

    public function create(): Response
    {
        $warehouses = Warehouse::select('id', 'name')->orderBy('name')->get();
        $products   = Product::select('id', 'name', 'sku')->orderBy('name')->get();
        $categories = ProductCategory::select('id', 'name')->orderBy('name')->get();
        $zones      = WarehouseZone::select('id', 'name', 'warehouse_id')->orderBy('name')->get();
        $bins       = WarehouseBin::select('id', 'code', 'name', 'warehouse_id')->orderBy('code')->get();

        return Inertia::render('Inventory/PutAwayRules/Create', compact('warehouses', 'products', 'categories', 'zones', 'bins'));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'warehouse_id'          => 'required|exists:warehouses,id',
            'product_id'            => 'nullable|exists:products,id',
            'product_category_id'   => 'nullable|exists:product_categories,id',
            'location_in_zone_id'   => 'nullable|exists:warehouse_zones,id',
            'location_out_bin_id'   => 'nullable|exists:warehouse_bins,id',
            'location_out_zone_id'  => 'nullable|exists:warehouse_zones,id',
            'sequence'              => 'nullable|integer',
            'is_active'             => 'boolean',
            'notes'                 => 'nullable|string',
        ]);

        $data['tenant_id'] = app('tenant')->id;

        PutAwayRule::create($data);

        return redirect()->route('inventory.put-away-rules.index');
    }

    public function show(PutAwayRule $putAwayRule): Response
    {
        $putAwayRule->load('warehouse', 'product', 'category', 'locationInZone', 'locationOutBin', 'locationOutZone');

        return Inertia::render('Inventory/PutAwayRules/Show', compact('putAwayRule'));
    }

    public function edit(PutAwayRule $putAwayRule): Response
    {
        $warehouses = Warehouse::select('id', 'name')->orderBy('name')->get();
        $products   = Product::select('id', 'name', 'sku')->orderBy('name')->get();
        $categories = ProductCategory::select('id', 'name')->orderBy('name')->get();
        $zones      = WarehouseZone::select('id', 'name', 'warehouse_id')->orderBy('name')->get();
        $bins       = WarehouseBin::select('id', 'code', 'name', 'warehouse_id')->orderBy('code')->get();

        return Inertia::render('Inventory/PutAwayRules/Edit', compact('putAwayRule', 'warehouses', 'products', 'categories', 'zones', 'bins'));
    }

    public function update(Request $request, PutAwayRule $putAwayRule): RedirectResponse
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'warehouse_id'          => 'required|exists:warehouses,id',
            'product_id'            => 'nullable|exists:products,id',
            'product_category_id'   => 'nullable|exists:product_categories,id',
            'location_in_zone_id'   => 'nullable|exists:warehouse_zones,id',
            'location_out_bin_id'   => 'nullable|exists:warehouse_bins,id',
            'location_out_zone_id'  => 'nullable|exists:warehouse_zones,id',
            'sequence'              => 'nullable|integer',
            'is_active'             => 'boolean',
            'notes'                 => 'nullable|string',
        ]);

        $putAwayRule->update($data);

        return redirect()->route('inventory.put-away-rules.index');
    }

    public function destroy(PutAwayRule $putAwayRule): RedirectResponse
    {
        $putAwayRule->delete();

        return redirect()->route('inventory.put-away-rules.index');
    }

    public function activate(PutAwayRule $putAwayRule): RedirectResponse
    {
        $putAwayRule->update(['is_active' => true]);

        return redirect()->route('inventory.put-away-rules.index');
    }

    public function deactivate(PutAwayRule $putAwayRule): RedirectResponse
    {
        $putAwayRule->update(['is_active' => false]);

        return redirect()->route('inventory.put-away-rules.index');
    }
}

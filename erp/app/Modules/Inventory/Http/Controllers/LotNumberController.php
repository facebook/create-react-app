<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\LotNumber;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LotNumberController extends Controller
{
    public function index(Request $request): Response
    {
        $lots = LotNumber::with(['product', 'warehouse'])
            ->when($request->product_id,   fn ($q) => $q->where('product_id',   $request->product_id))
            ->when($request->warehouse_id, fn ($q) => $q->where('warehouse_id', $request->warehouse_id))
            ->when($request->status,       fn ($q) => $q->where('status',       $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/LotNumbers/Index', [
            'lots'       => $lots,
            'products'   => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'filters'    => $request->only(['product_id', 'warehouse_id', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', LotNumber::class);

        $validated = $request->validate([
            'product_id'        => 'required|exists:products,id',
            'warehouse_id'      => 'required|exists:warehouses,id',
            'lot_number'        => 'required|string|max:255',
            'manufacture_date'  => 'nullable|date',
            'expiry_date'       => 'nullable|date|after:manufacture_date',
            'quantity_received' => 'required|integer|min:1',
        ]);

        $validated['tenant_id']          = auth()->user()->tenant_id;
        $validated['quantity_remaining']  = $validated['quantity_received'];

        LotNumber::create($validated);

        return back()->with('success', 'Lot number created successfully.');
    }

    public function show(LotNumber $lotNumber): Response
    {
        $lotNumber->load(['product', 'warehouse', 'serialNumbers']);

        return Inertia::render('Inventory/LotNumbers/Show', [
            'lot' => $lotNumber,
        ]);
    }

    public function quarantine(Request $request, LotNumber $lotNumber): RedirectResponse
    {
        $request->validate([
            'notes' => 'nullable|string',
        ]);

        $lotNumber->quarantine($request->notes);

        return back()->with('success', 'Lot quarantined.');
    }

    public function consume(Request $request, LotNumber $lotNumber): RedirectResponse
    {
        $request->validate([
            'qty' => 'required|integer|min:1',
        ]);

        $lotNumber->consume((int) $request->qty);

        return back()->with('success', 'Lot consumption recorded.');
    }
}

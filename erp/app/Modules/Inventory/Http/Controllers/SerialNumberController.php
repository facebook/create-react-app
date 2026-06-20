<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\SerialNumber;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SerialNumberController extends Controller
{
    public function index(Request $request): Response
    {
        $serials = SerialNumber::with(['product', 'warehouse'])
            ->when($request->product_id, fn ($q) => $q->where('product_id', $request->product_id))
            ->when($request->status,     fn ($q) => $q->where('status',     $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/SerialNumbers/Index', [
            'serials'    => $serials,
            'products'   => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'filters'    => $request->only(['product_id', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id'    => 'required|exists:products,id',
            'warehouse_id'  => 'required|exists:warehouses,id',
            'serial_number' => 'required|string|max:255|unique:serial_numbers,serial_number',
            'received_date' => 'nullable|date',
            'lot_number_id' => 'nullable|exists:lot_numbers,id',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        SerialNumber::create($validated);

        return back()->with('success', 'Serial number created successfully.');
    }

    public function show(SerialNumber $serialNumber): Response
    {
        $serialNumber->load(['product', 'warehouse', 'lot']);

        return Inertia::render('Inventory/SerialNumbers/Show', [
            'serial' => $serialNumber,
        ]);
    }

    public function sell(Request $request, SerialNumber $serialNumber): RedirectResponse
    {
        $serialNumber->sell($request->notes);

        return back()->with('success', 'Serial number marked as sold.');
    }

    public function scrap(Request $request, SerialNumber $serialNumber): RedirectResponse
    {
        $serialNumber->scrap($request->notes);

        return back()->with('success', 'Serial number scrapped.');
    }
}

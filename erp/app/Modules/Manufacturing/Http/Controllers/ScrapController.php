<?php

namespace App\Modules\Manufacturing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\Manufacturing\Models\ScrapOrder;
use App\Modules\Inventory\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScrapController extends Controller
{
    public function index(Request $request): Response
    {
        $scrapOrders = ScrapOrder::with(['product', 'manufacturingOrder', 'scrappedBy'])
            ->when($request->manufacturing_order_id, fn ($q) => $q->where('manufacturing_order_id', $request->manufacturing_order_id))
            ->orderByDesc('scrapped_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Manufacturing/Scrap/Index', [
            'scrapOrders'         => $scrapOrders,
            'products'            => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'manufacturingOrders' => ManufacturingOrder::orderByDesc('created_at')->get(['id', 'mo_number']),
            'filters'             => $request->only(['manufacturing_order_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id'              => 'required|exists:products,id',
            'quantity'                => 'required|numeric|min:0.0001',
            'uom'                     => 'nullable|string|max:50',
            'manufacturing_order_id'  => 'nullable|exists:manufacturing_orders,id',
            'reason'                  => 'nullable|string',
        ]);

        $scrap = ScrapOrder::create($validated);
        $scrap->scrap();

        return redirect()->route('manufacturing.scrap.index')
            ->with('success', 'Scrap order recorded.');
    }

    public function destroy(ScrapOrder $scrapOrder): RedirectResponse
    {
        $scrapOrder->delete();

        return redirect()->route('manufacturing.scrap.index')
            ->with('success', 'Scrap order deleted.');
    }
}

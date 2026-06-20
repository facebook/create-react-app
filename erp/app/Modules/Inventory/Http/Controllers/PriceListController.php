<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\PriceList;
use App\Modules\Inventory\Models\PriceListItem;
use App\Modules\Inventory\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PriceListController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PriceList::class);

        $priceLists = PriceList::latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/PriceLists/Index', [
            'priceLists' => $priceLists,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', PriceList::class);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'currency'   => 'nullable|string|max:3',
            'is_active'  => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
            'valid_from' => 'nullable|date',
            'valid_to'   => 'nullable|date',
            'notes'      => 'nullable|string',
        ]);

        $validated['tenant_id'] = app('tenant')->id;
        $validated['currency'] = $validated['currency'] ?? 'USD';

        PriceList::create($validated);

        return back();
    }

    public function show(PriceList $priceList): Response
    {
        $this->authorize('view', $priceList);

        $priceList->load('items.product');

        return Inertia::render('Inventory/PriceLists/Show', [
            'priceList' => $priceList,
            'products'  => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']),
        ]);
    }

    public function addItem(Request $request, PriceList $priceList): RedirectResponse
    {
        $this->authorize('update', $priceList);

        $validated = $request->validate([
            'product_id'   => 'required|exists:products,id',
            'price'        => 'required|numeric|min:0',
            'min_quantity' => 'nullable|numeric|min:1',
        ]);

        $validated['tenant_id']    = app('tenant')->id;
        $validated['price_list_id'] = $priceList->id;
        $validated['min_quantity'] = $validated['min_quantity'] ?? 1;

        PriceListItem::create($validated);

        return back();
    }

    public function removeItem(PriceList $priceList, PriceListItem $priceListItem): RedirectResponse
    {
        $this->authorize('update', $priceList);

        $priceListItem->delete();

        return back();
    }

    public function destroy(PriceList $priceList): RedirectResponse
    {
        $this->authorize('delete', $priceList);

        $priceList->delete();

        return back();
    }
}

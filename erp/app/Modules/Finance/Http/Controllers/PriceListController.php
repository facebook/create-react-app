<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\PriceList;
use App\Modules\Finance\Models\PriceListItem;
use App\Modules\Inventory\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PriceListController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', PriceList::class);

        $priceLists = PriceList::withCount(['items', 'contacts'])
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Finance/PriceLists/Index', [
            'priceLists'  => $priceLists,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Price Lists', 'href' => route('finance.price-lists.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', PriceList::class);

        return Inertia::render('Finance/PriceLists/Create', [
            'products'    => Product::orderBy('name')->get(['id', 'name', 'sku', 'sale_price']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Price Lists', 'href' => route('finance.price-lists.index')],
                ['label' => 'New Price List'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', PriceList::class);

        $data = $request->validate([
            'name'              => 'required|string|max:191',
            'description'       => 'nullable|string',
            'currency_code'     => 'required|string|size:3',
            'discount_percent'  => 'nullable|numeric|min:0|max:100',
            'is_active'         => 'boolean',
            'is_default'        => 'boolean',
            'valid_from'        => 'nullable|date',
            'valid_to'          => 'nullable|date',
            'items'             => 'nullable|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $tenantId = auth()->user()->tenant_id;

        $priceList = DB::transaction(function () use ($data, $tenantId) {
            // If setting as default, clear existing defaults
            if (!empty($data['is_default'])) {
                PriceList::where('tenant_id', $tenantId)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $list = PriceList::create([
                'tenant_id'        => $tenantId,
                'name'             => $data['name'],
                'description'      => $data['description'] ?? null,
                'currency_code'    => $data['currency_code'],
                'discount_percent' => $data['discount_percent'] ?? 0,
                'is_active'        => $data['is_active'] ?? true,
                'is_default'       => $data['is_default'] ?? false,
                'valid_from'       => $data['valid_from'] ?? null,
                'valid_to'         => $data['valid_to'] ?? null,
            ]);

            foreach ($data['items'] ?? [] as $item) {
                PriceListItem::create([
                    'tenant_id'     => $tenantId,
                    'price_list_id' => $list->id,
                    'product_id'    => $item['product_id'],
                    'unit_price'    => $item['unit_price'],
                    'min_quantity'  => $item['min_quantity'] ?? 1,
                ]);
            }

            return $list;
        });

        return redirect()->route('finance.price-lists.show', $priceList)
            ->with('success', 'Price list created.');
    }

    public function show(PriceList $priceList): Response
    {
        $this->authorize('view', $priceList);

        $items = $priceList->items()->with('product')->paginate(15);

        return Inertia::render('Finance/PriceLists/Show', [
            'priceList'   => $priceList->load('contacts'),
            'items'       => $items,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Price Lists', 'href' => route('finance.price-lists.index')],
                ['label' => $priceList->name],
            ],
        ]);
    }

    public function update(Request $request, PriceList $priceList): RedirectResponse
    {
        $this->authorize('update', $priceList);

        $data = $request->validate([
            'name'              => 'required|string|max:191',
            'description'       => 'nullable|string',
            'currency_code'     => 'nullable|string|size:3',
            'discount_percent'  => 'nullable|numeric|min:0|max:100',
            'is_active'         => 'boolean',
            'is_default'        => 'boolean',
            'valid_from'        => 'nullable|date',
            'valid_to'          => 'nullable|date',
            'items'             => 'nullable|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($data, $priceList) {
            $priceList->update([
                'name'             => $data['name'],
                'description'      => $data['description'] ?? null,
                'currency_code'    => $data['currency_code'] ?? 'USD',
                'discount_percent' => $data['discount_percent'] ?? 0,
                'is_active'        => $data['is_active'] ?? true,
                'is_default'       => $data['is_default'] ?? false,
                'valid_from'       => $data['valid_from'] ?? null,
                'valid_to'         => $data['valid_to'] ?? null,
            ]);

            // Sync items
            $priceList->items()->delete();
            foreach ($data['items'] ?? [] as $item) {
                PriceListItem::create([
                    'tenant_id'     => $priceList->tenant_id,
                    'price_list_id' => $priceList->id,
                    'product_id'    => $item['product_id'],
                    'unit_price'    => $item['unit_price'],
                    'min_quantity'  => $item['min_quantity'] ?? 1,
                ]);
            }
        });

        return redirect()->route('finance.price-lists.show', $priceList)
            ->with('success', 'Price list updated.');
    }

    public function destroy(PriceList $priceList): RedirectResponse
    {
        $this->authorize('delete', $priceList);

        $priceList->delete();

        return redirect()->route('finance.price-lists.index')
            ->with('success', 'Price list deleted.');
    }

    public function addItem(Request $request, PriceList $priceList): RedirectResponse
    {
        $this->authorize('create', PriceList::class);

        $data = $request->validate([
            'product_id'   => 'required|exists:products,id',
            'unit_price'   => 'required|numeric|min:0',
            'min_quantity' => 'required|integer|min:1',
        ]);

        PriceListItem::create([
            'tenant_id'     => $priceList->tenant_id,
            'price_list_id' => $priceList->id,
            'product_id'    => $data['product_id'],
            'unit_price'    => $data['unit_price'],
            'min_quantity'  => $data['min_quantity'],
        ]);

        return redirect()->back()->with('success', 'Item added to price list.');
    }

    public function removeItem(PriceList $priceList, PriceListItem $item): RedirectResponse
    {
        $this->authorize('delete', $priceList);

        $item->delete();

        return redirect()->back()->with('success', 'Item removed from price list.');
    }

    public function priceForContact(Request $request)
    {
        $this->authorize('viewAny', PriceList::class);

        $data = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'product_id' => 'required|exists:products,id',
        ]);

        $contact = Contact::find($data['contact_id']);
        $product = Product::find($data['product_id']);

        if (!$contact->price_list_id) {
            return response()->json(['price' => (float) $product->sale_price]);
        }

        $price = PriceList::priceFor($contact->price_list_id, $data['product_id'], (float) $product->sale_price);
        return response()->json(['price' => $price]);
    }
}

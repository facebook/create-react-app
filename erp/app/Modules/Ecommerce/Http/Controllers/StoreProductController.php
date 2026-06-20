<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\StoreCategory;
use App\Modules\Ecommerce\Models\StoreProduct;
use App\Modules\Inventory\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreProductController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $products = StoreProduct::with(['product', 'category'])
            ->where('tenant_id', $tenantId)
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->has('is_visible') && $request->is_visible !== '', fn ($q) => $q->where('is_visible', $request->boolean('is_visible')))
            ->when($request->has('is_featured') && $request->is_featured !== '', fn ($q) => $q->where('is_featured', $request->boolean('is_featured')))
            ->orderBy('sort_order')
            ->paginate(20)
            ->through(fn ($sp) => [
                'id'            => $sp->id,
                'store_price'   => $sp->store_price,
                'compare_price' => $sp->compare_price,
                'is_featured'   => $sp->is_featured,
                'is_visible'    => $sp->is_visible,
                'sort_order'    => $sp->sort_order,
                'product'       => $sp->product ? [
                    'id'   => $sp->product->id,
                    'name' => $sp->product->name,
                    'sku'  => $sp->product->sku,
                ] : null,
                'category'      => $sp->category ? [
                    'id'   => $sp->category->id,
                    'name' => $sp->category->name,
                ] : null,
            ]);

        $categories = StoreCategory::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Ecommerce/Products/Index', [
            'storeProducts' => $products,
            'categories'    => $categories,
            'filters'       => $request->only(['category_id', 'is_visible', 'is_featured']),
        ]);
    }

    public function create(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $existingProductIds = StoreProduct::where('tenant_id', $tenantId)->pluck('product_id');

        $inventoryProducts = Product::where('tenant_id', $tenantId)
            ->whereNotIn('id', $existingProductIds)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'sale_price']);

        $categories = StoreCategory::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Ecommerce/Products/Create', [
            'inventoryProducts' => $inventoryProducts,
            'categories'        => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = auth()->user()->tenant_id;

        $data = $request->validate([
            'product_id'        => 'required|exists:products,id',
            'category_id'       => 'nullable|exists:store_categories,id',
            'store_price'       => 'required|numeric|min:0',
            'compare_price'     => 'nullable|numeric|min:0',
            'is_featured'       => 'boolean',
            'is_visible'        => 'boolean',
            'sort_order'        => 'nullable|integer|min:0',
            'short_description' => 'nullable|string',
            'long_description'  => 'nullable|string',
            'meta_title'        => 'nullable|string|max:255',
            'meta_description'  => 'nullable|string',
        ]);

        StoreProduct::create(array_merge($data, ['tenant_id' => $tenantId]));

        return redirect()->route('ecommerce.products.index')->with('success', 'Product added to store.');
    }

    public function edit(StoreProduct $product): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $product->load(['product', 'category']);

        $categories = StoreCategory::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Ecommerce/Products/Edit', [
            'storeProduct' => $product,
            'categories'   => $categories,
        ]);
    }

    public function update(Request $request, StoreProduct $product): RedirectResponse
    {
        $data = $request->validate([
            'category_id'       => 'nullable|exists:store_categories,id',
            'store_price'       => 'required|numeric|min:0',
            'compare_price'     => 'nullable|numeric|min:0',
            'is_featured'       => 'boolean',
            'is_visible'        => 'boolean',
            'sort_order'        => 'nullable|integer|min:0',
            'short_description' => 'nullable|string',
            'long_description'  => 'nullable|string',
            'meta_title'        => 'nullable|string|max:255',
            'meta_description'  => 'nullable|string',
        ]);

        $product->update($data);

        return redirect()->route('ecommerce.products.index')->with('success', 'Store product updated.');
    }

    public function destroy(StoreProduct $product): RedirectResponse
    {
        $product->delete();

        return redirect()->route('ecommerce.products.index')->with('success', 'Store product removed.');
    }
}

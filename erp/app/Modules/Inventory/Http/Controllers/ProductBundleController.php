<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\ProductBundle;
use App\Modules\Inventory\Models\ProductBundleItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductBundleController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', ProductBundle::class);

        $bundles = ProductBundle::where('tenant_id', app('tenant')->id)
            ->latest()
            ->paginate(20);

        return Inertia::render('Inventory/ProductBundles/Index', compact('bundles'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ProductBundle::class);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'sku'          => 'nullable|string|max:100',
            'description'  => 'nullable|string',
            'bundle_price' => 'nullable|numeric|min:0',
            'is_active'    => 'nullable|boolean',
        ]);

        $validated['tenant_id'] = app('tenant')->id;

        ProductBundle::create($validated);

        return back()->with('success', 'Product bundle created.');
    }

    public function show(ProductBundle $productBundle): Response
    {
        $this->authorize('view', $productBundle);

        $productBundle->load('items.product');

        return Inertia::render('Inventory/ProductBundles/Show', compact('productBundle'));
    }

    public function addItem(Request $request, ProductBundle $productBundle): RedirectResponse
    {
        $this->authorize('update', $productBundle);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|numeric|min:0.01',
        ]);

        ProductBundleItem::firstOrCreate(
            [
                'product_bundle_id' => $productBundle->id,
                'product_id'        => $validated['product_id'],
            ],
            [
                'tenant_id' => app('tenant')->id,
                'quantity'  => $validated['quantity'],
            ]
        );

        return back()->with('success', 'Item added to bundle.');
    }

    public function removeItem(ProductBundle $productBundle, ProductBundleItem $item): RedirectResponse
    {
        $this->authorize('update', $productBundle);

        $item->delete();

        return back()->with('success', 'Item removed from bundle.');
    }

    public function destroy(ProductBundle $productBundle): RedirectResponse
    {
        $this->authorize('delete', $productBundle);

        $productBundle->delete();

        return back()->with('success', 'Product bundle deleted.');
    }
}

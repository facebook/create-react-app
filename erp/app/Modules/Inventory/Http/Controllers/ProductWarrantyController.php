<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductWarranty;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductWarrantyController
{
    public function index(): Response
    {
        $warranties = ProductWarranty::with('product')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Inventory/Warranties/Index', compact('warranties'));
    }

    public function create(): Response
    {
        $products = Product::select('id', 'name', 'sku')->orderBy('name')->get();

        return Inertia::render('Inventory/Warranties/Create', compact('products'));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'product_id'      => 'required|exists:products,id',
            'duration_months' => 'required|integer|min:1',
            'warranty_type'   => 'nullable|string|in:standard,extended,limited',
            'terms'           => 'nullable|string',
            'is_default'      => 'boolean',
        ]);

        $data['tenant_id'] = app('tenant')->id;

        ProductWarranty::create($data);

        return redirect()->route('inventory.warranties.index');
    }

    public function show(ProductWarranty $warranty): Response
    {
        $warranty->load('product', 'claims');

        return Inertia::render('Inventory/Warranties/Show', compact('warranty'));
    }

    public function edit(ProductWarranty $warranty): Response
    {
        $products = Product::select('id', 'name', 'sku')->orderBy('name')->get();

        return Inertia::render('Inventory/Warranties/Edit', compact('warranty', 'products'));
    }

    public function update(Request $request, ProductWarranty $warranty): RedirectResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'product_id'      => 'nullable|exists:products,id',
            'duration_months' => 'required|integer|min:1',
            'warranty_type'   => 'nullable|string|in:standard,extended,limited',
            'terms'           => 'nullable|string',
            'is_default'      => 'boolean',
        ]);

        $warranty->update($data);

        return redirect()->route('inventory.warranties.index');
    }

    public function destroy(ProductWarranty $warranty): RedirectResponse
    {
        $warranty->delete();

        return redirect()->route('inventory.warranties.index');
    }
}

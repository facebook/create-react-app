<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\ProductTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductTagController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ProductTag::class);

        $tags = ProductTag::where('tenant_id', auth()->user()->tenant_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('Inventory/ProductTags/Index', compact('tags'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ProductTag::class);

        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'color'       => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        ProductTag::create($validated);

        return back()->with('success', 'Product tag created.');
    }

    public function update(Request $request, ProductTag $productTag): RedirectResponse
    {
        $this->authorize('update', $productTag);

        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'color'       => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $productTag->update($validated);

        return back()->with('success', 'Product tag updated.');
    }

    public function destroy(ProductTag $productTag): RedirectResponse
    {
        $this->authorize('delete', $productTag);

        $productTag->delete();

        return back()->with('success', 'Product tag deleted.');
    }
}

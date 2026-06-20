<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductSubstitute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductSubstituteController extends Controller
{
    public function index(Request $request, Product $product): Response
    {
        $this->authorize('viewAny', ProductSubstitute::class);

        $substitutes = $product->substitutes()
            ->with('substituteProduct')
            ->get();

        return Inertia::render('Inventory/ProductSubstitutes/Index', [
            'product'     => $product,
            'substitutes' => $substitutes,
        ]);
    }

    public function store(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('create', ProductSubstitute::class);

        $validated = $request->validate([
            'substitute_product_id' => [
                'required',
                'exists:products,id',
                Rule::notIn([$product->id]),
            ],
            'priority'         => 'nullable|integer|min:1|max:10',
            'is_bidirectional' => 'boolean',
            'notes'            => 'nullable|string',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $isBidirectional = $validated['is_bidirectional'] ?? false;

        ProductSubstitute::create([
            'tenant_id'             => $tenantId,
            'product_id'            => $product->id,
            'substitute_product_id' => $validated['substitute_product_id'],
            'priority'              => $validated['priority'] ?? 1,
            'is_bidirectional'      => $isBidirectional,
            'is_active'             => true,
            'notes'                 => $validated['notes'] ?? null,
        ]);

        if ($isBidirectional) {
            ProductSubstitute::firstOrCreate(
                [
                    'product_id'            => $validated['substitute_product_id'],
                    'substitute_product_id' => $product->id,
                ],
                [
                    'tenant_id'        => $tenantId,
                    'priority'         => $validated['priority'] ?? 1,
                    'is_bidirectional' => true,
                    'is_active'        => true,
                    'notes'            => $validated['notes'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Product substitute added.');
    }

    public function update(Request $request, Product $product, ProductSubstitute $productSubstitute): RedirectResponse
    {
        $this->authorize('update', $productSubstitute);

        $validated = $request->validate([
            'priority'  => 'nullable|integer|min:1|max:10',
            'is_active' => 'boolean',
            'notes'     => 'nullable|string',
        ]);

        $productSubstitute->update($validated);

        return back()->with('success', 'Product substitute updated.');
    }

    public function destroy(Product $product, ProductSubstitute $productSubstitute): RedirectResponse
    {
        $this->authorize('delete', $productSubstitute);

        $productSubstitute->delete();

        return back()->with('success', 'Product substitute removed.');
    }
}

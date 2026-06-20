<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductAttribute;
use App\Modules\Inventory\Models\ProductVariant;
use App\Modules\Inventory\Models\ProductVariantValue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductVariantController
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ProductVariant::class);
        $query = ProductVariant::with(['product', 'values.attribute']);
        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }
        $variants = $query->paginate(20)->withQueryString();
        $products = Product::select('id', 'name', 'sku')->orderBy('name')->get();
        return Inertia::render('Inventory/ProductVariants/Index', [
            'variants' => $variants,
            'products' => $products,
            'filters'  => $request->only('product_id'),
        ]);
    }

    public function create()
    {
        $this->authorize('create', ProductVariant::class);
        $products   = Product::select('id', 'name', 'sku', 'sale_price')->orderBy('name')->get();
        $attributes = ProductAttribute::orderBy('name')->get();
        return Inertia::render('Inventory/ProductVariants/Create', [
            'products'   => $products,
            'attributes' => $attributes,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', ProductVariant::class);
        $data = $request->validate([
            'product_id'       => 'required|exists:products,id',
            'sku'              => 'required|string|unique:product_variants,sku',
            'name'             => 'required|string|max:200',
            'price_adjustment' => 'nullable|numeric',
            'stock_quantity'   => 'nullable|integer|min:0',
            'values'           => 'nullable|array',
            'values.*.attribute_id' => 'required|exists:product_attributes,id',
            'values.*.value'        => 'required|string',
        ]);

        $tenantId = app('tenant')->id;
        $variant  = ProductVariant::create([
            'tenant_id'        => $tenantId,
            'product_id'       => $data['product_id'],
            'sku'              => $data['sku'],
            'name'             => $data['name'],
            'price_adjustment' => $data['price_adjustment'] ?? 0,
            'stock_quantity'   => $data['stock_quantity'] ?? 0,
        ]);

        foreach ($data['values'] ?? [] as $v) {
            ProductVariantValue::create([
                'tenant_id'    => $tenantId,
                'variant_id'   => $variant->id,
                'attribute_id' => $v['attribute_id'],
                'value'        => $v['value'],
            ]);
        }

        return redirect()->route('inventory.product-variants.show', $variant)
            ->with('success', 'Variant created.');
    }

    public function show(ProductVariant $productVariant)
    {
        $this->authorize('view', $productVariant);
        $productVariant->load(['product', 'values.attribute']);
        return Inertia::render('Inventory/ProductVariants/Show', [
            'variant' => $productVariant,
        ]);
    }

    public function destroy(ProductVariant $productVariant)
    {
        $this->authorize('delete', $productVariant);
        $productVariant->delete();
        return redirect()->route('inventory.product-variants.index')
            ->with('success', 'Variant deleted.');
    }

    public function adjustStock(Request $request, ProductVariant $productVariant)
    {
        $this->authorize('update', $productVariant);
        $data = $request->validate(['delta' => 'required|integer']);
        $productVariant->adjustStock($data['delta']);
        return back()->with('success', 'Stock adjusted.');
    }

    private function authorize(string $ability, $model): void
    {
        if (auth()->user()->cannot($ability, $model)) {
            abort(403);
        }
    }
}

<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Http\Requests\StoreProductRequest;
use App\Modules\Inventory\Http\Requests\UpdateProductRequest;
use App\Modules\Inventory\Http\Resources\ProductResource;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\UnitOfMeasure;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $products = Product::with(['category', 'uom', 'stockLevels'])
            ->when($request->search, fn ($q) => $q->search($request->search))
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->status !== null, fn ($q) => match ($request->status) {
                'active'   => $q->active(),
                'inactive' => $q->where('is_active', false),
                default    => $q,
            })
            ->orderBy($request->sort ?? 'name', $request->direction ?? 'asc')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Inventory/Products/Index', [
            'products'     => ProductResource::collection($products),
            'categories'   => ProductCategory::orderBy('name')->get(['id', 'name', 'colour']),
            'filters'      => $request->only(['search', 'category_id', 'status', 'sort', 'direction']),
            'breadcrumbs'  => [
                ['label' => 'Inventory'],
                ['label' => 'Products', 'href' => route('inventory.products.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Product::class);

        return Inertia::render('Inventory/Products/Create', [
            'categories'  => ProductCategory::orderBy('name')->get(['id', 'name', 'colour']),
            'uoms'        => UnitOfMeasure::orderBy('name')->get(['id', 'name', 'abbreviation']),
            'breadcrumbs' => [
                ['label' => 'Inventory'],
                ['label' => 'Products', 'href' => route('inventory.products.index')],
                ['label' => 'New Product'],
            ],
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->authorize('create', Product::class);

        Product::create([...$request->validated(), 'tenant_id' => auth()->user()->tenant_id]);

        return redirect()->route('inventory.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function show(Product $product): Response
    {
        $this->authorize('view', $product);

        $product->load(['category', 'uom', 'stockLevels.warehouse', 'preferredSupplier']);

        $movements = $product->stockMovements()
            ->with('warehouse', 'creator')
            ->latest('created_at')
            ->paginate(20);

        $tenantId = auth()->user()->tenant_id;

        return Inertia::render('Inventory/Products/Show', [
            'product'     => new ProductResource($product),
            'movements'   => $movements,
            'suppliers'   => Supplier::where('tenant_id', $tenantId)->orderBy('name')->get(['id', 'name']),
            'breadcrumbs' => [
                ['label' => 'Inventory'],
                ['label' => 'Products', 'href' => route('inventory.products.index')],
                ['label' => $product->name],
            ],
        ]);
    }

    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);

        return Inertia::render('Inventory/Products/Edit', [
            'product'     => new ProductResource($product),
            'categories'  => ProductCategory::orderBy('name')->get(['id', 'name', 'colour']),
            'uoms'        => UnitOfMeasure::orderBy('name')->get(['id', 'name', 'abbreviation']),
            'breadcrumbs' => [
                ['label' => 'Inventory'],
                ['label' => 'Products', 'href' => route('inventory.products.index')],
                ['label' => $product->name, 'href' => route('inventory.products.show', $product)],
                ['label' => 'Edit'],
            ],
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);

        $product->update($request->validated());

        return redirect()->route('inventory.products.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);

        $product->delete();

        return redirect()->route('inventory.products.index')
            ->with('success', 'Product deleted.');
    }
}

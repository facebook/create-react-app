<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ProductCategory::class);
        $tenantId = $request->user()->tenant_id;
        $categories = ProductCategory::where('tenant_id', $tenantId)
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'slug'           => $c->slug,
                'description'    => $c->description,
                'colour'         => $c->colour,
                'products_count' => $c->products_count,
            ]);
        return Inertia::render('Inventory/ProductCategories/Index', compact('categories'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ProductCategory::class);
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'colour'      => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);
        $data['tenant_id'] = $request->user()->tenant_id;
        $data['slug']      = $this->uniqueSlug($data['tenant_id'], \Str::slug($data['name']));
        $data['colour']    = $data['colour'] ?? '#6366f1';
        ProductCategory::create($data);
        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, ProductCategory $productCategory): RedirectResponse
    {
        $this->authorize('update', $productCategory);
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'colour'      => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);
        $data['slug'] = $this->uniqueSlug($productCategory->tenant_id, \Str::slug($data['name']), $productCategory->id);
        $productCategory->update($data);
        return back()->with('success', 'Category updated.');
    }

    public function destroy(ProductCategory $productCategory): RedirectResponse
    {
        $this->authorize('delete', $productCategory);
        $productCategory->delete(); // products become uncategorised (nullOnDelete)
        return back()->with('success', 'Category deleted.');
    }

    private function uniqueSlug(int $tenantId, string $base, ?int $excludeId = null): string
    {
        $slug  = $base;
        $count = 2;
        while (
            ProductCategory::where('tenant_id', $tenantId)
                ->where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = $base . '-' . $count++;
        }
        return $slug;
    }
}

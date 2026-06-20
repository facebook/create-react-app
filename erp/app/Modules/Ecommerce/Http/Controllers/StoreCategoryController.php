<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\StoreCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StoreCategoryController extends Controller
{
    public function index(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $categories = StoreCategory::where('tenant_id', $tenantId)
            ->withCount('storeProducts')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id'                   => $c->id,
                'name'                 => $c->name,
                'slug'                 => $c->slug,
                'description'          => $c->description,
                'parent_id'            => $c->parent_id,
                'sort_order'           => $c->sort_order,
                'is_active'            => $c->is_active,
                'store_products_count' => $c->store_products_count,
            ]);

        return Inertia::render('Ecommerce/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = auth()->user()->tenant_id;

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id'   => 'nullable|exists:store_categories,id',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $slug = Str::slug($data['name']);
        $originalSlug = $slug;
        $counter = 1;
        while (StoreCategory::where('tenant_id', $tenantId)->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        StoreCategory::create(array_merge($data, [
            'tenant_id' => $tenantId,
            'slug'      => $slug,
        ]));

        return redirect()->back()->with('success', 'Category created.');
    }

    public function update(Request $request, StoreCategory $category): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id'   => 'nullable|exists:store_categories,id',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $category->update($data);

        return redirect()->back()->with('success', 'Category updated.');
    }

    public function destroy(StoreCategory $category): RedirectResponse
    {
        $category->delete();

        return redirect()->back()->with('success', 'Category deleted.');
    }
}

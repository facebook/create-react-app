<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Inventory\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductApiController extends ApiController
{
    /**
     * GET /api/v1/products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $paginator = $query->select(['id', 'name', 'sku', 'sale_price', 'cost_price', 'stock_quantity', 'is_active', 'category_id'])
                           ->latest()
                           ->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/products/{id}
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with('category')->findOrFail($id);

        return $this->success($product);
    }

    /**
     * POST /api/v1/products
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'sku'         => 'required|string|max:100',
            'sale_price'  => 'required|numeric|min:0',
            'cost_price'  => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'is_active'   => 'nullable|boolean',
            'reorder_point' => 'nullable|numeric|min:0',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $validated['tenant_id'] = $tenantId;

        $product = Product::create($validated);

        return $this->success($product, 201);
    }

    /**
     * PUT /api/v1/products/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'sku'         => 'sometimes|string|max:100',
            'sale_price'  => 'sometimes|numeric|min:0',
            'cost_price'  => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'is_active'   => 'nullable|boolean',
            'reorder_point' => 'nullable|numeric|min:0',
        ]);

        $product->update($validated);

        return $this->success($product);
    }

    /**
     * DELETE /api/v1/products/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return $this->success(['message' => 'Product deleted']);
    }
}

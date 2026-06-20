<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Ecommerce\Models\StoreCategory;
use App\Modules\Ecommerce\Models\StoreOrder;
use App\Modules\Ecommerce\Models\StoreProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EcommerceApiController extends ApiController
{
    public function storeProducts(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = StoreProduct::where('tenant_id', $tenantId);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_visible', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function showStoreProduct(int $id): JsonResponse
    {
        $product = StoreProduct::with('category')->findOrFail($id);

        return $this->success($product);
    }

    public function storeOrders(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = StoreOrder::where('tenant_id', $tenantId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function showStoreOrder(int $id): JsonResponse
    {
        $order = StoreOrder::with('items')->findOrFail($id);

        return $this->success($order);
    }

    public function categories(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $categories = StoreCategory::where('tenant_id', $tenantId)
            ->orderBy('sort_order')
            ->get();

        return $this->success($categories);
    }
}

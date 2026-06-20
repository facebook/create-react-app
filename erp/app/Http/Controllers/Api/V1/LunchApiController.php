<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Lunch\Models\LunchOrder;
use App\Modules\Lunch\Models\LunchProduct;
use App\Modules\Lunch\Models\LunchSupplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LunchApiController extends ApiController
{
    /**
     * GET /api/v1/lunch/suppliers
     */
    public function suppliers(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $paginator = LunchSupplier::where('tenant_id', $tenantId)->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/lunch/products
     */
    public function products(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = LunchProduct::where('tenant_id', $tenantId);

        if ($supplierId = $request->query('supplier_id')) {
            $query->where('lunch_supplier_id', $supplierId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/lunch/orders
     */
    public function orders(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = LunchOrder::where('tenant_id', $tenantId);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/lunch/orders
     */
    public function storeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lunch_product_id' => 'required|integer|exists:lunch_products,id',
            'quantity'         => 'required|integer|min:1',
            'order_date'       => 'required|date',
            'notes'            => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $product = LunchProduct::findOrFail($validated['lunch_product_id']);

        $validated['tenant_id']   = $tenantId;
        $validated['employee_id'] = $request->user()->id;
        $validated['status']      = 'pending';
        $validated['total_price'] = $product->price * $validated['quantity'];

        $order = LunchOrder::create($validated);

        return $this->success($order, 201);
    }

    /**
     * POST /api/v1/lunch/orders/{id}/cancel
     */
    public function cancelOrder(int $id): JsonResponse
    {
        $order = LunchOrder::findOrFail($id);
        $order->update(['status' => 'cancelled']);

        return $this->success($order);
    }
}

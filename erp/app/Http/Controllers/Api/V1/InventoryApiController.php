<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryApiController extends ApiController
{
    /**
     * GET /api/v1/inventory/stock
     */
    public function stock(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($warehouseId = $request->query('warehouse_id')) {
            // Filter by warehouse via stock levels
            $query->whereHas('stockLevels', fn ($q) => $q->where('warehouse_id', $warehouseId));
        }

        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock_quantity', '<', 'reorder_point')
                  ->where('reorder_point', '>', 0);
        }

        $paginator = $query->select(['id', 'name', 'sku', 'stock_quantity', 'reorder_point', 'is_active'])
                           ->latest()
                           ->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/inventory/movements
     */
    public function movements(Request $request): JsonResponse
    {
        $query = StockMovement::with(['product:id,name,sku', 'warehouse:id,name'])
                              ->latest();

        $paginator = $query->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/inventory/adjust
     */
    public function adjust(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id'  => 'required|integer|exists:products,id',
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'quantity'    => 'required|numeric',
            'reason'      => 'nullable|string',
        ]);

        $type = $validated['quantity'] >= 0 ? 'in' : 'out';

        $movement = StockMovement::record([
            'product_id'  => $validated['product_id'],
            'warehouse_id' => $validated['warehouse_id'],
            'type'        => $type,
            'quantity'    => abs($validated['quantity']),
            'notes'       => $validated['reason'] ?? null,
        ]);

        return $this->success($movement, 201);
    }
}

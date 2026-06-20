<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseStockController extends ApiController
{
    // ── Warehouses ────────────────────────────────────────────────────────────

    public function indexWarehouses(Request $request): JsonResponse
    {
        $tenantId   = $this->tenantId($request);
        $warehouses = Warehouse::where('tenant_id', $tenantId)
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->withCount('stockLevels')
            ->get();

        return $this->success($warehouses);
    }

    public function storeWarehouse(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $warehouse = Warehouse::create([...$data, 'tenant_id' => $tenantId, 'is_active' => true]);

        return $this->success($warehouse, 201);
    }

    public function showWarehouse(Warehouse $warehouse): JsonResponse
    {
        $warehouse->load('stockLevels.product:id,name,sku');

        $totalValue = $warehouse->stockLevels->sum(
            fn ($sl) => (float) $sl->quantity * (float) $sl->product?->cost_price
        );

        return $this->success([
            'id'           => $warehouse->id,
            'name'         => $warehouse->name,
            'location'     => $warehouse->location,
            'is_active'    => $warehouse->is_active,
            'total_value'  => round($totalValue, 2),
            'stock_lines'  => $warehouse->stockLevels->count(),
            'stock_levels' => $warehouse->stockLevels->map(fn ($sl) => [
                'product_id'         => $sl->product_id,
                'product_name'       => $sl->product?->name,
                'sku'                => $sl->product?->sku,
                'quantity'           => (float) $sl->quantity,
                'reserved_quantity'  => (float) $sl->reserved_quantity,
                'available'          => $sl->available,
            ]),
        ]);
    }

    public function updateWarehouse(Request $request, Warehouse $warehouse): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['sometimes', 'string', 'max:100'],
            'location'  => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $warehouse->update($data);

        return $this->success($warehouse->fresh());
    }

    // ── Stock Levels ──────────────────────────────────────────────────────────

    public function stockByProduct(Request $request, int $productId): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $product = Product::where('tenant_id', $tenantId)->findOrFail($productId);
        $levels  = StockLevel::where('product_id', $productId)
            ->with('warehouse:id,name,location')
            ->get();

        return $this->success([
            'product_id'   => $product->id,
            'product_name' => $product->name,
            'sku'          => $product->sku,
            'total_qty'    => (float) $levels->sum('quantity'),
            'total_available' => (float) $levels->sum('available'),
            'warehouses'   => $levels->map(fn ($sl) => [
                'warehouse_id'   => $sl->warehouse_id,
                'warehouse_name' => $sl->warehouse?->name,
                'quantity'       => (float) $sl->quantity,
                'reserved'       => (float) $sl->reserved_quantity,
                'available'      => $sl->available,
            ]),
        ]);
    }

    public function setStockLevel(Request $request, int $warehouseId, int $productId): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'quantity'          => ['required', 'numeric', 'min:0'],
            'reserved_quantity' => ['nullable', 'numeric', 'min:0'],
        ]);

        $level = StockLevel::updateOrCreate(
            ['warehouse_id' => $warehouseId, 'product_id' => $productId],
            [
                'tenant_id'         => $tenantId,
                'quantity'          => $data['quantity'],
                'reserved_quantity' => $data['reserved_quantity'] ?? 0,
            ]
        );

        return $this->success($level);
    }

    // ── Stock Transfer ────────────────────────────────────────────────────────

    public function transfer(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'from_warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'to_warehouse_id'   => ['required', 'integer', 'exists:warehouses,id', 'different:from_warehouse_id'],
            'product_id'        => ['required', 'integer', 'exists:products,id'],
            'quantity'          => ['required', 'numeric', 'min:0.01'],
            'notes'             => ['nullable', 'string', 'max:500'],
        ]);

        $from = StockLevel::where('warehouse_id', $data['from_warehouse_id'])
            ->where('product_id', $data['product_id'])
            ->first();

        if (! $from || (float) $from->available < (float) $data['quantity']) {
            return $this->error('Insufficient available stock in source warehouse.', 422);
        }

        $from->decrement('quantity', $data['quantity']);

        StockLevel::updateOrCreate(
            ['warehouse_id' => $data['to_warehouse_id'], 'product_id' => $data['product_id']],
            ['tenant_id' => $tenantId, 'quantity' => 0, 'reserved_quantity' => 0]
        );
        StockLevel::where('warehouse_id', $data['to_warehouse_id'])
            ->where('product_id', $data['product_id'])
            ->increment('quantity', $data['quantity']);

        StockMovement::create([
            'tenant_id'    => $tenantId,
            'product_id'   => $data['product_id'],
            'warehouse_id' => $data['from_warehouse_id'],
            'type'         => 'transfer',
            'quantity'     => -$data['quantity'],
            'reference'    => "Transfer to W#{$data['to_warehouse_id']}",
            'notes'        => $data['notes'] ?? null,
            'created_by'   => $request->user()->id,
        ]);

        return $this->success([
            'transferred' => $data['quantity'],
            'product_id'  => $data['product_id'],
            'from'        => $data['from_warehouse_id'],
            'to'          => $data['to_warehouse_id'],
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

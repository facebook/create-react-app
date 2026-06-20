<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Inventory\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReorderController extends ApiController
{
    public function suggestions(Request $request): JsonResponse
    {
        $tenantId  = $this->tenantId($request);
        $threshold = (float) $request->get('threshold', 1.0);

        $products = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('reorder_point', '>', 0)
            ->with(['preferredSupplier'])
            ->get()
            ->map(fn ($p) => (object) [
                'product' => $p,
                'stock'   => (float) $p->stock_quantity,
            ])
            ->filter(fn ($r) => ($r->stock / max($r->product->reorder_point, 1)) <= $threshold)
            ->map(fn ($r) => [
                'product_id'        => $r->product->id,
                'sku'               => $r->product->sku,
                'name'              => $r->product->name,
                'current_stock'     => $r->stock,
                'reorder_point'     => (float) $r->product->reorder_point,
                'reorder_quantity'  => (float) ($r->product->reorder_quantity ?? 0),
                'deficit'           => max(0.0, (float) $r->product->reorder_point - $r->stock),
                'suggested_qty'     => max((float) ($r->product->reorder_quantity ?? 0), (float) $r->product->reorder_point - $r->stock),
                'supplier'          => $r->product->preferredSupplier?->only(['id', 'name']),
                'urgency'           => $r->stock <= 0 ? 'critical' : ($r->stock < $r->product->reorder_point * 0.5 ? 'high' : 'medium'),
            ])
            ->sortByDesc('urgency')
            ->values();

        return $this->success([
            'total_items'    => $products->count(),
            'critical_count' => $products->where('urgency', 'critical')->count(),
            'high_count'     => $products->where('urgency', 'high')->count(),
            'suggestions'    => $products,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $total    = Product::where('tenant_id', $tenantId)->where('is_active', true)->count();
        $lowStock = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('reorder_point', '>', 0)
            ->where('stock_quantity', '<=', \DB::raw('reorder_point'))
            ->count();
        $outOfStock = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('stock_quantity', '<=', 0)
            ->count();

        return $this->success([
            'total_products'  => $total,
            'low_stock_count' => $lowStock,
            'out_of_stock'    => $outOfStock,
            'healthy_stock'   => $total - $lowStock,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

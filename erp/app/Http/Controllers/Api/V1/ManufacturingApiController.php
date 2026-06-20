<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Manufacturing\Models\BillOfMaterials;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManufacturingApiController extends ApiController
{
    /**
     * GET /api/v1/manufacturing/orders
     */
    public function orders(Request $request): JsonResponse
    {
        $query = ManufacturingOrder::with('product:id,name,sku');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        $items = collect($paginator->items())->map(fn (ManufacturingOrder $mo) => [
            'id'            => $mo->id,
            'mo_number'     => $mo->mo_number,
            'product'       => $mo->product?->name,
            'qty_to_produce' => $mo->qty_to_produce,
            'qty_produced'  => $mo->qty_produced,
            'status'        => $mo->status,
            'scheduled_date' => $mo->scheduled_date?->toDateString(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $items,
            'meta'    => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/manufacturing/orders/{order}
     */
    public function show(int $order): JsonResponse
    {
        $mo = ManufacturingOrder::with(['product', 'components.product:id,name,sku', 'bom'])->findOrFail($order);

        return $this->success($mo);
    }

    /**
     * PUT /api/v1/manufacturing/orders/{order}/status
     */
    public function updateStatus(Request $request, int $order): JsonResponse
    {
        $mo = ManufacturingOrder::findOrFail($order);

        $validated = $request->validate([
            'status' => 'required|string|in:draft,confirmed,in_progress,done,cancelled',
        ]);

        $mo->update(['status' => $validated['status']]);

        return $this->success($mo);
    }

    /**
     * GET /api/v1/manufacturing/boms
     */
    public function boms(Request $request): JsonResponse
    {
        $query = BillOfMaterials::with('product:id,name,sku');

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }
}

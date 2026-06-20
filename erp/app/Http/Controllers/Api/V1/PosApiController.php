<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\POS\Models\PosOrder;
use App\Modules\POS\Models\PosOrderItem;
use App\Modules\POS\Models\PosSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosApiController extends ApiController
{
    /**
     * GET /api/v1/pos/sessions
     */
    public function sessions(Request $request): JsonResponse
    {
        $query = PosSession::with('openedBy:id,name');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/pos/sessions/{session}/orders
     */
    public function sessionOrders(int $session): JsonResponse
    {
        $posSession = PosSession::findOrFail($session);

        $orders = $posSession->orders()->with('items')->latest()->paginate(20);

        return $this->paginated($orders);
    }

    /**
     * POST /api/v1/pos/orders
     */
    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id'      => 'required|integer|exists:pos_sessions,id',
            'customer_name'   => 'nullable|string|max:255',
            'customer_email'  => 'nullable|email|max:255',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount'      => 'nullable|numeric|min:0',
            'amount_paid'     => 'nullable|numeric|min:0',
            'payment_method'  => 'nullable|string|max:50',
            'notes'           => 'nullable|string',
            'items'           => 'nullable|array',
            'items.*.product_id'  => 'required_with:items|integer|exists:products,id',
            'items.*.quantity'    => 'required_with:items|numeric|min:0',
            'items.*.unit_price'  => 'required_with:items|numeric|min:0',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $items = $validated['items'] ?? [];
        unset($validated['items']);

        $validated['tenant_id']  = $tenantId;
        $validated['created_by'] = $request->user()->id;
        $validated['served_by']  = $request->user()->id;
        $validated['status']     = 'completed';

        // Calculate subtotal
        $subtotal = 0;
        foreach ($items as $item) {
            $subtotal += (float) $item['quantity'] * (float) $item['unit_price'];
        }

        $validated['subtotal']        = $subtotal;
        $validated['discount_amount'] = $validated['discount_amount'] ?? 0;
        $validated['tax_amount']      = $validated['tax_amount'] ?? 0;
        $validated['total']           = $subtotal - $validated['discount_amount'] + $validated['tax_amount'];
        $validated['amount_paid']     = $validated['amount_paid'] ?? $validated['total'];
        $validated['change_given']    = max(0, $validated['amount_paid'] - $validated['total']);

        $order = PosOrder::create($validated);
        $order->receipt_number = $order->generateReceiptNumber();
        $order->save();

        foreach ($items as $item) {
            $lineTotal = (float) $item['quantity'] * (float) $item['unit_price'];
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity'   => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'line_total' => $lineTotal,
            ]);
        }

        return $this->success($order->load('items'), 201);
    }

    /**
     * GET /api/v1/pos/orders/{order}
     */
    public function showOrder(int $order): JsonResponse
    {
        $posOrder = PosOrder::with(['items.product:id,name,sku', 'session:id,name'])->findOrFail($order);

        return $this->success($posOrder);
    }
}

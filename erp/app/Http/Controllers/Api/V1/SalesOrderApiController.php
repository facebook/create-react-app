<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\SalesOrder;
use App\Modules\Finance\Models\SalesOrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesOrderApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $orders   = SalesOrder::where('tenant_id', $tenantId)
            ->with('contact:id,name')
            ->withCount('items')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('contact_id'), fn ($q, $c) => $q->where('contact_id', $c))
            ->orderByDesc('order_date')
            ->get();

        return $this->success($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'contact_id'    => ['required', 'integer', 'exists:contacts,id'],
            'order_date'    => ['required', 'date'],
            'expected_date' => ['nullable', 'date', 'after_or_equal:order_date'],
            'currency_code' => ['nullable', 'string', 'max:3'],
            'notes'         => ['nullable', 'string'],
            'items'         => ['required', 'array', 'min:1'],
            'items.*.product_id'  => ['nullable', 'integer', 'exists:products,id'],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity'    => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_price'  => ['required', 'numeric', 'min:0'],
            'items.*.tax_rate'    => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $soNumber = 'SO-' . now()->format('Y') . '-' . str_pad((string) (SalesOrder::max('id') + 1), 5, '0', STR_PAD_LEFT);

        $order = SalesOrder::create([
            'tenant_id'     => $tenantId,
            'contact_id'    => $data['contact_id'],
            'number'        => $soNumber,
            'order_date'    => $data['order_date'],
            'expected_date' => $data['expected_date'] ?? null,
            'currency_code' => $data['currency_code'] ?? 'USD',
            'notes'         => $data['notes'] ?? null,
            'status'        => 'draft',
            'created_by'    => $request->user()->id,
        ]);

        foreach ($data['items'] as $item) {
            $qty   = (float) $item['quantity'];
            $price = (float) $item['unit_price'];
            $tax   = (float) ($item['tax_rate'] ?? 0);

            SalesOrderItem::create([
                'sales_order_id' => $order->id,
                'product_id'     => $item['product_id'] ?? null,
                'description'    => $item['description'],
                'quantity'       => $qty,
                'unit_price'     => $price,
                'tax_rate'       => $tax,
                'line_total'     => round($qty * $price * (1 + $tax / 100), 2),
            ]);
        }

        return $this->success($order->load('items.product:id,name,sku', 'contact:id,name'), 201);
    }

    public function show(SalesOrder $salesOrder): JsonResponse
    {
        return $this->success($salesOrder->load('items.product:id,name,sku', 'contact:id,name', 'generatedInvoice'));
    }

    public function update(Request $request, SalesOrder $salesOrder): JsonResponse
    {
        if (! in_array($salesOrder->status, ['draft'])) {
            return $this->error('Only draft orders can be updated.', 422);
        }

        $data = $request->validate([
            'expected_date' => ['nullable', 'date'],
            'notes'         => ['nullable', 'string'],
            'currency_code' => ['nullable', 'string', 'max:3'],
        ]);

        $salesOrder->update($data);

        return $this->success($salesOrder->fresh()->load('items'));
    }

    public function destroy(SalesOrder $salesOrder): JsonResponse
    {
        if (! in_array($salesOrder->status, ['draft', 'cancelled'])) {
            return $this->error('Only draft or cancelled orders can be deleted.', 422);
        }

        $salesOrder->items()->delete();
        $salesOrder->delete();

        return $this->success(['message' => 'Sales order deleted.']);
    }

    public function confirm(SalesOrder $salesOrder): JsonResponse
    {
        if ($salesOrder->status !== 'draft') {
            return $this->error('Only draft orders can be confirmed.', 422);
        }

        $salesOrder->update(['status' => 'confirmed']);

        return $this->success($salesOrder->fresh());
    }

    public function cancel(SalesOrder $salesOrder): JsonResponse
    {
        if (in_array($salesOrder->status, ['invoiced', 'cancelled'])) {
            return $this->error("Cannot cancel order in status '{$salesOrder->status}'.", 422);
        }

        $salesOrder->update(['status' => 'cancelled']);

        return $this->success($salesOrder->fresh());
    }

    public function convertToInvoice(SalesOrder $salesOrder): JsonResponse
    {
        try {
            $invoice = $salesOrder->convertToInvoice();
        } catch (\Throwable $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success(['invoice' => $invoice, 'sales_order_status' => $salesOrder->fresh()->status]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

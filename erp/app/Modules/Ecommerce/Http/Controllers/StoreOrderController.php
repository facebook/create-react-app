<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\StoreOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $orders = StoreOrder::withCount('items')
            ->where('tenant_id', $tenantId)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->payment_status, fn ($q) => $q->where('payment_status', $request->payment_status))
            ->latest()
            ->paginate(25)
            ->through(fn ($o) => [
                'id'             => $o->id,
                'order_number'   => $o->order_number,
                'customer_name'  => $o->customer_name,
                'customer_email' => $o->customer_email,
                'items_count'    => $o->items_count,
                'total'          => $o->total,
                'status'         => $o->status,
                'payment_status' => $o->payment_status,
                'created_at'     => $o->created_at,
            ]);

        return Inertia::render('Ecommerce/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'payment_status']),
        ]);
    }

    public function show(StoreOrder $order): Response
    {
        $order->load(['items.storeProduct.product', 'processedBy']);

        return Inertia::render('Ecommerce/Orders/Show', [
            'order' => [
                'id'               => $order->id,
                'order_number'     => $order->order_number,
                'status'           => $order->status,
                'customer_name'    => $order->customer_name,
                'customer_email'   => $order->customer_email,
                'customer_phone'   => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'billing_address'  => $order->billing_address,
                'subtotal'         => $order->subtotal,
                'discount_amount'  => $order->discount_amount,
                'shipping_amount'  => $order->shipping_amount,
                'tax_amount'       => $order->tax_amount,
                'total'            => $order->total,
                'payment_method'   => $order->payment_method,
                'payment_status'   => $order->payment_status,
                'notes'            => $order->notes,
                'processed_by'     => $order->processedBy ? ['name' => $order->processedBy->name] : null,
                'created_at'       => $order->created_at,
                'items'            => $order->items->map(fn ($item) => [
                    'id'           => $item->id,
                    'product_name' => $item->product_name,
                    'product_sku'  => $item->product_sku,
                    'quantity'     => $item->quantity,
                    'unit_price'   => $item->unit_price,
                    'line_total'   => $item->line_total,
                ]),
            ],
        ]);
    }

    public function confirm(StoreOrder $order): RedirectResponse
    {
        $order->confirm();

        return redirect()->back()->with('success', 'Order confirmed.');
    }

    public function markPaid(StoreOrder $order): RedirectResponse
    {
        $order->markPaid();

        return redirect()->back()->with('success', 'Order marked as paid.');
    }

    public function ship(StoreOrder $order): RedirectResponse
    {
        $order->ship();

        return redirect()->back()->with('success', 'Order marked as shipped.');
    }

    public function deliver(StoreOrder $order): RedirectResponse
    {
        $order->deliver();

        return redirect()->back()->with('success', 'Order marked as delivered.');
    }

    public function cancel(StoreOrder $order): RedirectResponse
    {
        $order->cancel();

        return redirect()->back()->with('success', 'Order cancelled.');
    }
}

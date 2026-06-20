<?php

namespace App\Modules\POS\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\POS\Models\PosOrder;
use App\Modules\POS\Models\PosOrderItem;
use App\Modules\POS\Models\PosPayment;
use App\Modules\POS\Models\PosSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosTerminalController extends Controller
{
    public function terminal(Request $request): Response
    {
        $session = PosSession::where('status', 'open')
            ->where('opened_by', auth()->id())
            ->latest()
            ->first();

        return Inertia::render('POS/Terminal', [
            'session' => $session,
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        $products = Product::where('tenant_id', auth()->user()->tenant_id)
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->where('is_active', true)
            ->get(['id', 'name', 'sku', 'sale_price', 'cost_price'])
            ->map(fn ($p) => [
                'id'    => $p->id,
                'name'  => $p->name,
                'sku'   => $p->sku,
                'price' => $p->sale_price ?? 0,
            ]);

        return response()->json($products);
    }

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id'      => 'required|exists:pos_sessions,id',
            'items'           => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer',
            'items.*.name'    => 'required|string',
            'items.*.qty'     => 'required|numeric|min:0.01',
            'items.*.price'   => 'required|numeric|min:0',
            'payment_method'  => 'required|in:cash,card,mobile,digital_wallet',
            'amount_paid'     => 'required|numeric|min:0',
            'customer_name'   => 'nullable|string|max:255',
            'customer_email'  => 'nullable|email',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount'      => 'nullable|numeric|min:0',
        ]);

        $session = PosSession::findOrFail($validated['session_id']);

        $subtotal = collect($validated['items'])->sum(fn ($i) => $i['qty'] * $i['price']);
        $discount = $validated['discount_amount'] ?? 0;
        $tax      = $validated['tax_amount'] ?? 0;
        $total    = $subtotal - $discount + $tax;

        $paymentMethod = $validated['payment_method'] === 'mobile' ? 'digital_wallet' : $validated['payment_method'];

        $order = PosOrder::create([
            'tenant_id'       => auth()->user()->tenant_id,
            'session_id'      => $session->id,
            'customer_name'   => $validated['customer_name'] ?? null,
            'customer_email'  => $validated['customer_email'] ?? null,
            'subtotal'        => $subtotal,
            'discount_amount' => $discount,
            'tax_amount'      => $tax,
            'total'           => $total,
            'amount_paid'     => $validated['amount_paid'],
            'change_given'    => max(0, $validated['amount_paid'] - $total),
            'payment_method'  => $paymentMethod,
            'status'          => 'completed',
            'served_by'       => auth()->id(),
            'created_by'      => auth()->id(),
        ]);

        $order->receipt_number = $order->generateReceiptNumber();
        $order->save();

        foreach ($validated['items'] as $item) {
            PosOrderItem::create([
                'order_id'     => $order->id,
                'product_id'   => $item['product_id'],
                'product_name' => $item['name'],
                'quantity'     => $item['qty'],
                'unit_price'   => $item['price'],
                'line_total'   => $item['qty'] * $item['price'],
            ]);
        }

        PosPayment::create([
            'order_id' => $order->id,
            'method'   => $paymentMethod,
            'amount'   => $validated['amount_paid'],
        ]);

        $session->total_sales = ($session->total_sales ?? 0) + $total;
        $session->save();

        return response()->json([
            'order_id'       => $order->id,
            'receipt_number' => $order->receipt_number,
            'total'          => $total,
            'change_given'   => $order->change_given,
        ]);
    }

    public function receipt(PosSession $session, PosOrder $order): Response
    {
        $order->load('items');

        return Inertia::render('POS/Receipt', [
            'order'   => $order,
            'session' => $session,
        ]);
    }

    public function sessions(): Response
    {
        $sessions = PosSession::with(['openedBy', 'closedBy'])
            ->orderByDesc('opened_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('POS/Sessions', [
            'sessions' => $sessions,
        ]);
    }
}

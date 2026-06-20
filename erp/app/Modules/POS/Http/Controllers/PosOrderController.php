<?php

namespace App\Modules\POS\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\POS\Models\PosOrder;
use App\Modules\POS\Models\PosOrderItem;
use App\Modules\POS\Models\PosSession;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class PosOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = PosOrder::with(['session'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->session_id, fn ($q) => $q->where('session_id', $request->session_id))
            ->latest()
            ->paginate(25)
            ->through(fn ($o) => [
                'id'             => $o->id,
                'receipt_number' => $o->receipt_number,
                'customer_name'  => $o->customer_name,
                'session'        => $o->session ? ['id' => $o->session->id, 'name' => $o->session->name] : null,
                'total'          => $o->total,
                'payment_method' => $o->payment_method,
                'status'         => $o->status,
                'created_at'     => $o->created_at,
            ]);

        return Inertia::render('POS/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'session_id']),
        ]);
    }

    public function store(Request $request): Response
    {
        $data = $request->validate([
            'session_id'      => 'required|exists:pos_sessions,id',
            'customer_name'   => 'nullable|string|max:255',
            'customer_email'  => 'nullable|email|max:255',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount'      => 'nullable|numeric|min:0',
            'amount_paid'     => 'required|numeric|min:0',
            'payment_method'  => 'required|in:cash,card,digital_wallet,split',
            'notes'           => 'nullable|string',
            'items'           => 'required|array|min:1',
            'items.*.product_id'      => 'nullable|exists:products,id',
            'items.*.product_name'    => 'required|string',
            'items.*.product_sku'     => 'nullable|string',
            'items.*.quantity'        => 'required|numeric|min:0.001',
            'items.*.unit_price'      => 'required|numeric|min:0',
            'items.*.discount_percent' => 'nullable|numeric|min:0|max:100',
            'items.*.line_total'      => 'required|numeric|min:0',
        ]);

        $subtotal       = collect($data['items'])->sum('line_total');
        $discountAmount = $data['discount_amount'] ?? 0;
        $taxAmount      = $data['tax_amount'] ?? 0;
        $total          = $subtotal - $discountAmount + $taxAmount;
        $amountPaid     = $data['amount_paid'];
        $changeGiven    = max(0, $amountPaid - $total);

        $order = PosOrder::create([
            'tenant_id'       => auth()->user()->tenant_id,
            'session_id'      => $data['session_id'],
            'customer_name'   => $data['customer_name'] ?? null,
            'customer_email'  => $data['customer_email'] ?? null,
            'subtotal'        => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount'      => $taxAmount,
            'total'           => $total,
            'amount_paid'     => $amountPaid,
            'change_given'    => $changeGiven,
            'payment_method'  => $data['payment_method'],
            'status'          => 'completed',
            'notes'           => $data['notes'] ?? null,
            'served_by'       => auth()->id(),
            'created_by'      => auth()->id(),
        ]);

        $order->receipt_number = $order->generateReceiptNumber();
        $order->save();

        foreach ($data['items'] as $item) {
            PosOrderItem::create([
                'order_id'         => $order->id,
                'product_id'       => $item['product_id'] ?? null,
                'product_name'     => $item['product_name'],
                'product_sku'      => $item['product_sku'] ?? null,
                'quantity'         => $item['quantity'],
                'unit_price'       => $item['unit_price'],
                'discount_percent' => $item['discount_percent'] ?? 0,
                'line_total'       => $item['line_total'],
            ]);
        }

        // Update session total_sales
        $session = PosSession::find($data['session_id']);
        if ($session) {
            $session->total_sales += $total;
            $session->save();
        }

        $order->load('items', 'session', 'servedBy');

        return Inertia::render('POS/Orders/Receipt', [
            'order' => [
                'id'             => $order->id,
                'receipt_number' => $order->receipt_number,
                'customer_name'  => $order->customer_name,
                'customer_email' => $order->customer_email,
                'subtotal'       => $order->subtotal,
                'discount_amount'=> $order->discount_amount,
                'tax_amount'     => $order->tax_amount,
                'total'          => $order->total,
                'amount_paid'    => $order->amount_paid,
                'change_given'   => $order->change_given,
                'payment_method' => $order->payment_method,
                'status'         => $order->status,
                'created_at'     => $order->created_at,
                'session'        => $order->session ? ['id' => $order->session->id, 'name' => $order->session->name] : null,
                'items'          => $order->items->map(fn ($i) => [
                    'id'               => $i->id,
                    'product_name'     => $i->product_name,
                    'product_sku'      => $i->product_sku,
                    'quantity'         => $i->quantity,
                    'unit_price'       => $i->unit_price,
                    'discount_percent' => $i->discount_percent,
                    'line_total'       => $i->line_total,
                ]),
            ],
        ]);
    }

    public function show(PosOrder $order): Response
    {
        $order->load(['items', 'session', 'servedBy']);

        return Inertia::render('POS/Orders/Receipt', [
            'order' => [
                'id'             => $order->id,
                'receipt_number' => $order->receipt_number,
                'customer_name'  => $order->customer_name,
                'customer_email' => $order->customer_email,
                'subtotal'       => $order->subtotal,
                'discount_amount'=> $order->discount_amount,
                'tax_amount'     => $order->tax_amount,
                'total'          => $order->total,
                'amount_paid'    => $order->amount_paid,
                'change_given'   => $order->change_given,
                'payment_method' => $order->payment_method,
                'status'         => $order->status,
                'created_at'     => $order->created_at,
                'session'        => $order->session ? ['id' => $order->session->id, 'name' => $order->session->name] : null,
                'items'          => $order->items->map(fn ($i) => [
                    'id'               => $i->id,
                    'product_name'     => $i->product_name,
                    'product_sku'      => $i->product_sku,
                    'quantity'         => $i->quantity,
                    'unit_price'       => $i->unit_price,
                    'discount_percent' => $i->discount_percent,
                    'line_total'       => $i->line_total,
                ]),
            ],
        ]);
    }

    public function refund(PosOrder $order): \Illuminate\Http\RedirectResponse
    {
        $order->status = 'refunded';
        $order->save();

        $session = $order->session;
        if ($session) {
            $session->total_refunds += $order->total;
            $session->save();
        }

        return redirect()->back()->with('success', 'Order refunded successfully.');
    }

    public function pdf(PosOrder $order): HttpResponse
    {
        $order->load(['items', 'servedBy', 'session.warehouse']);
        $session = $order->session;
        $pdf = Pdf::loadView('pdf.receipt', compact('order', 'session'));
        $pdf->setPaper([0, 0, 226.77, 600], 'portrait'); // 80mm width
        return response($pdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="receipt-' . $order->receipt_number . '.pdf"',
        ]);
    }
}

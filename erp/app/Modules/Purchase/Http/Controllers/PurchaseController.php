<?php

namespace App\Modules\Purchase\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Purchase\Models\Po;
use App\Modules\Purchase\Models\PoLine;
use App\Modules\Purchase\Models\PurchaseRfq;
use App\Modules\Purchase\Models\PurchaseRfqLine;
use App\Modules\Purchase\Models\PurchaseVendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function dashboard(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $stats = [
            'total_vendors'      => PurchaseVendor::where('tenant_id', $tenantId)->count(),
            'open_rfqs'          => PurchaseRfq::where('tenant_id', $tenantId)
                ->whereIn('status', ['draft', 'sent'])
                ->count(),
            'open_pos'           => Po::where('tenant_id', $tenantId)
                ->whereIn('status', ['draft', 'confirmed'])
                ->count(),
            'received_this_month' => Po::where('tenant_id', $tenantId)
                ->where('status', 'received')
                ->whereMonth('received_at', now()->month)
                ->whereYear('received_at', now()->year)
                ->count(),
        ];

        return Inertia::render('Purchase/Dashboard', compact('stats'));
    }

    public function vendors(): Response
    {
        $vendors = PurchaseVendor::where('tenant_id', auth()->user()->tenant_id)
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Purchase/Vendors/Index', compact('vendors'));
    }

    public function storeVendor(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'nullable|email|max:255',
            'phone'         => 'nullable|string|max:50',
            'address'       => 'nullable|string',
            'currency'      => 'nullable|string|max:3',
            'payment_terms' => 'nullable|string|max:255',
            'is_active'     => 'nullable|boolean',
            'rating'        => 'nullable|integer|min:1|max:5',
        ]);

        PurchaseVendor::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$data,
        ]);

        return redirect()->back()->with('success', 'Vendor created successfully.');
    }

    public function rfqs(): Response
    {
        $rfqs = PurchaseRfq::where('tenant_id', auth()->user()->tenant_id)
            ->with('vendor')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $vendors = PurchaseVendor::where('tenant_id', auth()->user()->tenant_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Purchase/Rfqs/Index', compact('rfqs', 'vendors'));
    }

    public function storeRfq(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'po_vendor_id'      => 'required|exists:po_vendors,id',
            'expected_delivery' => 'nullable|date',
            'notes'             => 'nullable|string',
            'currency'          => 'nullable|string|max:3',
        ]);

        $rfqNumber = 'RFQ-' . now()->format('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

        PurchaseRfq::create([
            'tenant_id'  => auth()->user()->tenant_id,
            'rfq_number' => $rfqNumber,
            'status'     => 'draft',
            ...$data,
        ]);

        return redirect()->back()->with('success', 'RFQ created successfully.');
    }

    public function showRfq(PurchaseRfq $rfq): Response
    {
        $rfq->load(['vendor', 'lines']);

        return Inertia::render('Purchase/Rfqs/Show', compact('rfq'));
    }

    public function addRfqLine(Request $request, PurchaseRfq $rfq): JsonResponse
    {
        $data = $request->validate([
            'product_name' => 'required|string|max:255',
            'description'  => 'nullable|string',
            'quantity'     => 'required|numeric|min:0.001',
            'unit_price'   => 'required|numeric|min:0',
            'uom'          => 'nullable|string|max:50',
        ]);

        $subtotal = $data['quantity'] * $data['unit_price'];

        PurchaseRfqLine::create([
            'tenant_id' => auth()->user()->tenant_id,
            'po_rfq_id' => $rfq->id,
            'subtotal'  => $subtotal,
            ...$data,
        ]);

        return response()->json(['success' => true]);
    }

    public function sendRfq(PurchaseRfq $rfq): JsonResponse
    {
        $rfq->send();

        return response()->json(['success' => true]);
    }

    public function convertToPo(PurchaseRfq $rfq): JsonResponse
    {
        $rfq->load('lines');
        $po = $rfq->toPurchaseOrder();

        return response()->json(['success' => true, 'po_id' => $po->id]);
    }

    public function pos(): Response
    {
        $pos = Po::where('tenant_id', auth()->user()->tenant_id)
            ->with('vendor')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Purchase/Pos/Index', compact('pos'));
    }

    public function showPo(Po $po): Response
    {
        $po->load(['vendor', 'lines']);

        return Inertia::render('Purchase/Pos/Show', compact('po'));
    }

    public function confirmPo(Po $po): JsonResponse
    {
        $po->confirm();

        return response()->json(['success' => true]);
    }

    public function receivePo(Po $po): JsonResponse
    {
        $po->receive();

        return response()->json(['success' => true]);
    }
}

<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\DeliveryNote;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\SalesOrder;
use App\Modules\Inventory\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryNoteController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', DeliveryNote::class);
        $deliveryNotes = DeliveryNote::with(['contact', 'salesOrder', 'invoice'])
            ->orderByDesc('created_at')
            ->paginate(25);
        return Inertia::render('Finance/DeliveryNotes/Index', compact('deliveryNotes'));
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', DeliveryNote::class);
        $contacts    = Contact::where('type', 'customer')->orWhere('type', 'both')->orderBy('name')->get(['id', 'name']);
        $salesOrders = SalesOrder::whereIn('status', ['confirmed', 'invoiced'])->orderByDesc('order_date')->get(['id', 'reference', 'number']);
        $invoices    = Invoice::whereIn('status', ['sent', 'partial'])->orderByDesc('issue_date')->get(['id', 'reference']);
        $products    = Product::orderBy('name')->get(['id', 'name', 'sku']);
        $salesOrderId = $request->get('sales_order_id');
        $invoiceId    = $request->get('invoice_id');
        return Inertia::render('Finance/DeliveryNotes/Create', compact('contacts', 'salesOrders', 'invoices', 'products', 'salesOrderId', 'invoiceId'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', DeliveryNote::class);
        $data = $request->validate([
            'reference'           => 'required|string|max:100|unique:delivery_notes,reference',
            'sales_order_id'      => 'nullable|exists:sales_orders,id',
            'invoice_id'          => 'nullable|exists:invoices,id',
            'contact_id'          => 'nullable|exists:contacts,id',
            'carrier'             => 'nullable|string|max:100',
            'tracking_number'     => 'nullable|string|max:100',
            'dispatch_date'       => 'nullable|date',
            'notes'               => 'nullable|string',
            'items'               => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.product_id'  => 'nullable|exists:products,id',
            'items.*.quantity'    => 'required|numeric|min:0.01',
        ]);

        $dn = DeliveryNote::create([
            'tenant_id'       => auth()->user()->tenant_id,
            'reference'       => $data['reference'],
            'sales_order_id'  => $data['sales_order_id'] ?? null,
            'invoice_id'      => $data['invoice_id'] ?? null,
            'contact_id'      => $data['contact_id'] ?? null,
            'carrier'         => $data['carrier'] ?? null,
            'tracking_number' => $data['tracking_number'] ?? null,
            'dispatch_date'   => $data['dispatch_date'] ?? null,
            'status'          => 'draft',
            'notes'           => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            $dn->items()->create([
                'product_id'  => $item['product_id'] ?? null,
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
            ]);
        }

        return redirect()->route('finance.delivery-notes.show', $dn)->with('success', 'Delivery note created.');
    }

    public function show(DeliveryNote $deliveryNote): Response
    {
        $this->authorize('view', $deliveryNote);
        $deliveryNote->load(['contact', 'salesOrder', 'invoice', 'items.product']);
        return Inertia::render('Finance/DeliveryNotes/Show', compact('deliveryNote'));
    }

    public function dispatch(DeliveryNote $deliveryNote, Request $request): RedirectResponse
    {
        $this->authorize('update', $deliveryNote);
        abort_unless($deliveryNote->status === 'draft', 422, 'Only draft notes can be dispatched.');
        $request->validate(['dispatch_date' => 'nullable|date']);
        $deliveryNote->update([
            'status'        => 'dispatched',
            'dispatch_date' => $request->dispatch_date ?? now()->toDateString(),
        ]);
        return back()->with('success', 'Delivery note dispatched.');
    }

    public function deliver(DeliveryNote $deliveryNote, Request $request): RedirectResponse
    {
        $this->authorize('update', $deliveryNote);
        abort_unless($deliveryNote->status === 'dispatched', 422, 'Only dispatched notes can be marked delivered.');
        $request->validate(['delivery_date' => 'nullable|date']);
        $deliveryNote->update([
            'status'        => 'delivered',
            'delivery_date' => $request->delivery_date ?? now()->toDateString(),
        ]);
        return back()->with('success', 'Delivery confirmed.');
    }

    public function destroy(DeliveryNote $deliveryNote): RedirectResponse
    {
        $this->authorize('delete', $deliveryNote);
        abort_unless($deliveryNote->status === 'draft', 422, 'Only draft delivery notes can be deleted.');
        $deliveryNote->delete();
        return redirect()->route('finance.delivery-notes.index')->with('success', 'Delivery note deleted.');
    }
}

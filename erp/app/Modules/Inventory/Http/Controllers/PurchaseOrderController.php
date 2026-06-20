<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\PurchaseOrder;
use App\Modules\Inventory\Models\PurchaseOrderItem;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PurchaseOrder::class);

        $orders = PurchaseOrder::with('supplier')
            ->when($request->status,      fn ($q) => $q->where('status', $request->status))
            ->when($request->supplier_id, fn ($q) => $q->where('supplier_id', $request->supplier_id))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/PurchaseOrders/Index', [
            'orders'    => $orders,
            'filters'   => $request->only(['status', 'supplier_id']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', PurchaseOrder::class);

        return Inertia::render('Inventory/PurchaseOrders/Create', [
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'products'  => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', PurchaseOrder::class);

        $validated = $request->validate([
            'supplier_id'          => 'nullable|exists:suppliers,id',
            'order_date'           => 'required|date',
            'expected_date'        => 'nullable|date',
            'currency'             => 'nullable|string|max:3',
            'notes'                => 'nullable|string',
            'items'                => 'required|array|min:1',
            'items.*.description'  => 'required|string|max:255',
            'items.*.quantity'     => 'required|numeric|min:0.01',
            'items.*.unit_price'   => 'required|numeric|min:0',
            'items.*.product_id'   => 'nullable|exists:products,id',
        ]);

        $po = PurchaseOrder::create([
            'tenant_id'   => auth()->user()->tenant_id,
            'po_number'   => PurchaseOrder::generatePoNumber(),
            'supplier_id' => $validated['supplier_id'] ?? null,
            'order_date'  => $validated['order_date'],
            'expected_date' => $validated['expected_date'] ?? null,
            'currency'    => $validated['currency'] ?? 'USD',
            'notes'       => $validated['notes'] ?? null,
            'created_by'  => auth()->id(),
            'subtotal'    => 0,
            'tax'         => 0,
            'total'       => 0,
        ]);

        foreach ($validated['items'] as $item) {
            PurchaseOrderItem::create([
                'tenant_id'         => auth()->user()->tenant_id,
                'purchase_order_id' => $po->id,
                'product_id'        => $item['product_id'] ?? null,
                'description'       => $item['description'],
                'quantity'          => $item['quantity'],
                'unit_price'        => $item['unit_price'],
                'received_qty'      => 0,
            ]);
        }

        $po->recalculateTotals();

        return redirect()->route('inventory.purchase-orders.show', $po);
    }

    public function show(PurchaseOrder $purchaseOrder): Response
    {
        $this->authorize('view', $purchaseOrder);
        $purchaseOrder->load(['supplier', 'items.product', 'createdBy']);

        return Inertia::render('Inventory/PurchaseOrders/Show', [
            'order' => $purchaseOrder,
        ]);
    }

    public function send(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->authorize('update', $purchaseOrder);
        $purchaseOrder->send();

        return back()->with('success', 'Purchase order sent.');
    }

    public function cancel(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->authorize('update', $purchaseOrder);
        $purchaseOrder->cancel();

        return back()->with('success', 'Purchase order cancelled.');
    }

    public function receive(Request $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->authorize('update', $purchaseOrder);

        // Accept both 'items' and 'lines' key; both 'received_qty' and 'received_quantity'
        $lines = $request->input('items') ?? $request->input('lines') ?? [];

        foreach ($lines as $data) {
            $item = PurchaseOrderItem::find($data['id'] ?? null);
            if (!$item || $item->purchase_order_id !== $purchaseOrder->id) {
                continue;
            }
            $qty = (float) ($data['received_qty'] ?? $data['received_quantity'] ?? 0);
            $prevQty = (float) $item->received_qty;
            $item->received_qty = $qty;
            $item->save();

            // Create stock movement for the delta if warehouse is set
            $delta = $qty - $prevQty;
            if ($delta > 0 && $purchaseOrder->warehouse_id && $item->product_id) {
                StockMovement::record([
                    'product_id'   => $item->product_id,
                    'warehouse_id' => $purchaseOrder->warehouse_id,
                    'type'         => 'in',
                    'quantity'     => $delta,
                    'reference'    => $purchaseOrder->po_number ?? ('PO-' . $purchaseOrder->id),
                    'notes'        => 'PO receiving',
                ]);
            }
        }

        $allReceived = $purchaseOrder->items()->get()->every(fn ($i) => (float)$i->received_qty >= (float)$i->quantity);
        $anyReceived = $purchaseOrder->items()->where('received_qty', '>', 0)->exists();

        if ($allReceived) {
            $purchaseOrder->markReceived();
        } elseif ($anyReceived) {
            $purchaseOrder->status = 'partial';
            $purchaseOrder->save();
        }

        return back()->with('success', 'Receiving updated.');
    }

    public function receiveForm(PurchaseOrder $purchaseOrder): Response
    {
        $this->authorize('view', $purchaseOrder);
        $purchaseOrder->load(['supplier', 'items.product']);
        return Inertia::render('Inventory/PurchaseOrders/Receive', ['order' => $purchaseOrder]);
    }

    public function transition(Request $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->authorize('update', $purchaseOrder);
        $status = $request->input('status');
        if ($status) {
            $purchaseOrder->status = $status;
            $purchaseOrder->save();
        }
        return back()->with('success', 'Status updated.');
    }

    public function submit(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->authorize('update', $purchaseOrder);
        $purchaseOrder->send();
        return back()->with('success', 'Purchase order submitted.');
    }

    public function approve(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->authorize('update', $purchaseOrder);
        $purchaseOrder->status = 'sent';
        $purchaseOrder->save();
        return back()->with('success', 'Purchase order approved.');
    }

    public function destroy(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->authorize('delete', $purchaseOrder);
        $purchaseOrder->delete();

        return redirect()->route('inventory.purchase-orders.index');
    }
}

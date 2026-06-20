<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Customer;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\SalesOrder;
use App\Modules\Inventory\Models\SalesOrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SalesOrder::class);

        $orders = SalesOrder::with('customer')
            ->when($request->status,      fn ($q) => $q->where('status', $request->status))
            ->when($request->customer_id, fn ($q) => $q->where('customer_id', $request->customer_id))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/SalesOrders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'customer_id']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SalesOrder::class);

        return Inertia::render('Inventory/SalesOrders/Create', [
            'customers' => Customer::orderBy('name')->get(['id', 'name']),
            'products'  => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', SalesOrder::class);

        $validated = $request->validate([
            'order_date'          => 'required|date',
            'expected_date'       => 'nullable|date',
            'currency'            => 'nullable|string|max:3',
            'notes'               => 'nullable|string',
            'customer_id'         => 'nullable|exists:contacts,id',
            'items'               => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity'    => 'required|numeric|min:0.01',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'items.*.product_id'  => 'nullable|exists:products,id',
        ]);

        $so = SalesOrder::create([
            'tenant_id'    => auth()->user()->tenant_id,
            'so_number'    => SalesOrder::generateSoNumber(),
            'customer_id'  => $validated['customer_id'] ?? null,
            'order_date'   => $validated['order_date'],
            'expected_date' => $validated['expected_date'] ?? null,
            'currency'     => $validated['currency'] ?? 'USD',
            'notes'        => $validated['notes'] ?? null,
            'created_by'   => auth()->id(),
            'subtotal'     => 0,
            'tax'          => 0,
            'total'        => 0,
        ]);

        foreach ($validated['items'] as $item) {
            SalesOrderItem::create([
                'tenant_id'      => auth()->user()->tenant_id,
                'sales_order_id' => $so->id,
                'product_id'     => $item['product_id'] ?? null,
                'description'    => $item['description'],
                'quantity'       => $item['quantity'],
                'unit_price'     => $item['unit_price'],
                'shipped_qty'    => 0,
            ]);
        }

        $so->recalculateTotals();

        return redirect()->route('inventory.sales-orders.show', $so);
    }

    public function show(SalesOrder $salesOrder): Response
    {
        $this->authorize('view', $salesOrder);
        $salesOrder->load(['customer', 'items.product', 'createdBy']);

        return Inertia::render('Inventory/SalesOrders/Show', [
            'order' => $salesOrder,
        ]);
    }

    public function confirm(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('update', $salesOrder);
        $salesOrder->confirm();

        return back()->with('success', 'Sales order confirmed.');
    }

    public function ship(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('update', $salesOrder);
        $salesOrder->ship();

        return back()->with('success', 'Sales order shipped.');
    }

    public function deliver(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('update', $salesOrder);
        $salesOrder->deliver();

        return back()->with('success', 'Sales order delivered.');
    }

    public function cancel(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('update', $salesOrder);
        $salesOrder->cancel();

        return back()->with('success', 'Sales order cancelled.');
    }

    public function destroy(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('delete', $salesOrder);
        $salesOrder->delete();

        return redirect()->route('inventory.sales-orders.index');
    }
}

<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Http\Requests\StoreSalesOrderRequest;
use App\Modules\Finance\Http\Resources\SalesOrderResource;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\SalesOrder;
use App\Modules\Finance\Models\SalesOrderItem;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SalesOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SalesOrder::class);

        $salesOrders = SalesOrder::with(['contact', 'warehouse'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->contact_id, fn ($q) => $q->where('contact_id', $request->contact_id))
            ->when($request->search, fn ($q) => $q->where('number', 'like', "%{$request->search}%"))
            ->latest('order_date')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Finance/SalesOrders/Index', [
            'salesOrders' => SalesOrderResource::collection($salesOrders),
            'contacts'    => Contact::customers()->active()->orderBy('name')->get(['id', 'name']),
            'filters'     => $request->only(['status', 'contact_id', 'search']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Sales Orders', 'href' => route('finance.sales-orders.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SalesOrder::class);

        return Inertia::render('Finance/SalesOrders/Create', [
            'contacts'    => Contact::customers()->active()->orderBy('name')->get(['id', 'name']),
            'warehouses'  => Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'products'    => Product::active()->orderBy('name')->get(['id', 'name', 'sku', 'sale_price']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Sales Orders', 'href' => route('finance.sales-orders.index')],
                ['label' => 'New Sales Order'],
            ],
        ]);
    }

    public function store(StoreSalesOrderRequest $request): RedirectResponse
    {
        $this->authorize('create', SalesOrder::class);

        $data = $request->validated();

        $salesOrder = DB::transaction(function () use ($data) {
            $salesOrder = SalesOrder::create([
                'tenant_id'     => auth()->user()->tenant_id,
                'contact_id'    => $data['contact_id'] ?? null,
                'warehouse_id'  => $data['warehouse_id'] ?? null,
                'reference'     => $data['reference'] ?? null,
                'order_date'    => $data['order_date'],
                'expected_date' => $data['expected_date'] ?? null,
                'currency_code' => $data['currency_code'] ?? 'USD',
                'exchange_rate' => $data['exchange_rate'] ?? 1,
                'notes'         => $data['notes'] ?? null,
                'created_by'    => auth()->id(),
            ]);

            $salesOrder->update([
                'number' => 'SO-' . now()->format('Y') . '-' . str_pad((string) $salesOrder->id, 5, '0', STR_PAD_LEFT),
            ]);

            foreach ($data['items'] as $item) {
                SalesOrderItem::create([
                    'sales_order_id' => $salesOrder->id,
                    'product_id'     => $item['product_id'] ?? null,
                    'description'    => $item['description'],
                    'quantity'       => $item['quantity'],
                    'unit_price'     => $item['unit_price'],
                    'tax_rate'       => $item['tax_rate'],
                ]);
            }

            return $salesOrder;
        });

        return redirect()->route('finance.sales-orders.show', $salesOrder)
            ->with('success', 'Sales order created.');
    }

    public function show(SalesOrder $salesOrder): Response
    {
        $this->authorize('view', $salesOrder);

        $salesOrder->load(['contact', 'warehouse', 'invoice', 'items.product', 'creator']);

        return Inertia::render('Finance/SalesOrders/Show', [
            'salesOrder'  => new SalesOrderResource($salesOrder),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Sales Orders', 'href' => route('finance.sales-orders.index')],
                ['label' => $salesOrder->number ?? "Sales Order #{$salesOrder->id}"],
            ],
        ]);
    }

    public function confirm(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('update', $salesOrder);

        try {
            $salesOrder->transitionTo('confirmed');
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Sales order confirmed.');
    }

    public function fulfill(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('update', $salesOrder);

        try {
            $salesOrder->fulfill();
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Sales order fulfilled and stock updated.');
    }

    public function cancel(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('update', $salesOrder);

        try {
            $salesOrder->transitionTo('cancelled');
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Sales order cancelled.');
    }

    public function convertToInvoice(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('update', $salesOrder);

        if (! in_array($salesOrder->status, ['confirmed', 'fulfilled'], true)) {
            return back()->withErrors(['status' => 'Only confirmed or fulfilled orders can be invoiced.']);
        }

        if ($salesOrder->invoice_id) {
            return back()->withErrors(['status' => 'This order has already been invoiced.']);
        }

        $invoice = DB::transaction(function () use ($salesOrder) {
            $salesOrder->load('items');

            $invoice = Invoice::create([
                'tenant_id'      => $salesOrder->tenant_id,
                'sales_order_id' => $salesOrder->id,
                'contact_id'     => $salesOrder->contact_id,
                'issue_date'     => now()->toDateString(),
                'due_date'       => now()->addDays(30)->toDateString(),
                'status'         => 'draft',
                'notes'          => $salesOrder->notes,
                'created_by'     => auth()->id(),
                'currency_code'  => $salesOrder->currency_code ?? 'USD',
                'exchange_rate'  => $salesOrder->exchange_rate ?? 1,
            ]);

            $invoice->update([
                'number' => 'INV-' . now()->format('Y') . '-' . str_pad((string) $invoice->id, 5, '0', STR_PAD_LEFT),
            ]);

            foreach ($salesOrder->items as $item) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'description' => $item->description,
                    'quantity'    => $item->quantity,
                    'unit_price'  => $item->unit_price,
                    'tax_rate'    => $item->tax_rate,
                ]);
            }

            $salesOrder->update(['invoice_id' => $invoice->id]);

            return $invoice;
        });

        return redirect()->route('finance.invoices.show', $invoice)
            ->with('success', 'Invoice created from sales order.');
    }

    public function destroy(SalesOrder $salesOrder): RedirectResponse
    {
        $this->authorize('delete', $salesOrder);

        $salesOrder->delete();

        return redirect()->route('finance.sales-orders.index')
            ->with('success', 'Sales order deleted.');
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Jobs\SendInvoiceNotificationJob;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceApiController extends ApiController
{
    /**
     * GET /api/v1/invoices
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with('contact');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($customerId = $request->query('customer_id')) {
            $query->where('contact_id', $customerId);
        }

        $paginator = $query->latest()->paginate(20);

        $items = collect($paginator->items())->map(fn (Invoice $inv) => [
            'id'             => $inv->id,
            'invoice_number' => $inv->number,
            'customer_name'  => $inv->contact?->name,
            'total'          => $inv->total,
            'status'         => $inv->status,
            'due_date'       => $inv->due_date?->toDateString(),
            'issue_date'     => $inv->issue_date?->toDateString(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $items,
            'meta'    => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/v1/invoices/{id}
     */
    public function show(int $id): JsonResponse
    {
        $invoice = Invoice::with(['contact', 'items'])->findOrFail($id);

        return $this->success($invoice);
    }

    /**
     * POST /api/v1/invoices
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contact_id' => 'required|integer|exists:contacts,id',
            'issue_date' => 'required|date',
            'due_date'   => 'nullable|date',
            'status'     => 'nullable|string',
            'notes'      => 'nullable|string',
            'items'      => 'nullable|array',
            'items.*.description' => 'required_with:items|string',
            'items.*.quantity'    => 'required_with:items|numeric|min:0',
            'items.*.unit_price'  => 'required_with:items|numeric|min:0',
            'items.*.tax_rate'    => 'nullable|numeric|min:0',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $items = $validated['items'] ?? [];
        unset($validated['items']);

        $validated['tenant_id'] = $tenantId;
        $validated['created_by'] = $request->user()->id;

        $invoice = Invoice::create($validated);

        foreach ($items as $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
                'unit_price'  => $item['unit_price'],
                'tax_rate'    => $item['tax_rate'] ?? 0,
            ]);
        }

        SendInvoiceNotificationJob::dispatch($invoice);

        return $this->success($invoice->load('items'), 201);
    }

    /**
     * PUT /api/v1/invoices/{invoice}/status
     */
    public function updateStatus(Request $request, int $invoice): JsonResponse
    {
        $inv = Invoice::findOrFail($invoice);

        $validated = $request->validate([
            'status' => 'required|string|in:draft,sent,partial,paid,cancelled',
        ]);

        $inv->update(['status' => $validated['status']]);

        return $this->success($inv);
    }
}

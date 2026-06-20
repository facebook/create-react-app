<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use App\Modules\Finance\Models\Quote;
use App\Modules\Finance\Models\QuoteItem;
use App\Modules\Finance\Models\SalesOrder;
use App\Modules\Finance\Models\SalesOrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuoteApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $quotes   = Quote::where('tenant_id', $tenantId)
            ->with('contact:id,name')
            ->withCount('items')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('contact_id'), fn ($q, $c) => $q->where('contact_id', $c))
            ->orderByDesc('issue_date')
            ->get();

        return $this->success($quotes);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'contact_id'    => ['required', 'integer', 'exists:contacts,id'],
            'issue_date'    => ['required', 'date'],
            'expiry_date'   => ['nullable', 'date', 'after_or_equal:issue_date'],
            'currency_code' => ['nullable', 'string', 'max:3'],
            'notes'         => ['nullable', 'string'],
            'items'         => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity'    => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_price'  => ['required', 'numeric', 'min:0'],
            'items.*.tax_rate'    => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $number = 'QT-' . now()->format('Y') . '-' . str_pad((string) (Quote::max('id') + 1), 5, '0', STR_PAD_LEFT);

        $quote = Quote::create([
            'tenant_id'     => $tenantId,
            'contact_id'    => $data['contact_id'],
            'number'        => $number,
            'issue_date'    => $data['issue_date'],
            'expiry_date'   => $data['expiry_date'] ?? null,
            'currency_code' => $data['currency_code'] ?? 'USD',
            'notes'         => $data['notes'] ?? null,
            'created_by'    => $request->user()->id,
        ]);

        foreach ($data['items'] as $item) {
            QuoteItem::create([
                'quote_id'    => $quote->id,
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
                'unit_price'  => $item['unit_price'],
                'tax_rate'    => $item['tax_rate'] ?? 0,
            ]);
        }

        return $this->success($quote->load('items', 'contact:id,name'), 201);
    }

    public function show(Quote $quote): JsonResponse
    {
        return $this->success($quote->load('items', 'contact:id,name'));
    }

    public function update(Request $request, Quote $quote): JsonResponse
    {
        if ($quote->status !== 'draft') {
            return $this->error('Only draft quotes can be updated.', 422);
        }

        $data = $request->validate([
            'expiry_date' => ['nullable', 'date'],
            'notes'       => ['nullable', 'string'],
        ]);

        $quote->update($data);

        return $this->success($quote->fresh()->load('items'));
    }

    public function destroy(Quote $quote): JsonResponse
    {
        if (! in_array($quote->status, ['draft', 'cancelled'])) {
            return $this->error('Only draft or cancelled quotes can be deleted.', 422);
        }

        $quote->items()->delete();
        $quote->delete();

        return $this->success(['message' => 'Quote deleted.']);
    }

    public function send(Quote $quote): JsonResponse
    {
        if ($quote->status !== 'draft') {
            return $this->error('Only draft quotes can be sent.', 422);
        }

        $quote->update(['status' => 'sent']);

        return $this->success($quote->fresh());
    }

    public function accept(Quote $quote): JsonResponse
    {
        if ($quote->status !== 'sent') {
            return $this->error('Only sent quotes can be accepted.', 422);
        }

        $quote->update(['status' => 'accepted']);

        return $this->success($quote->fresh());
    }

    public function decline(Quote $quote): JsonResponse
    {
        if ($quote->status !== 'sent') {
            return $this->error('Only sent quotes can be declined.', 422);
        }

        $quote->update(['status' => 'declined']);

        return $this->success($quote->fresh());
    }

    public function convertToInvoice(Quote $quote): JsonResponse
    {
        if ($quote->status !== 'accepted') {
            return $this->error('Only accepted quotes can be converted to invoices.', 422);
        }

        $quote->load('items');
        $number = 'INV-' . now()->format('Y') . '-' . str_pad((string) (Invoice::max('id') + 1), 5, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'tenant_id'     => $quote->tenant_id,
            'contact_id'    => $quote->contact_id,
            'number'        => $number,
            'issue_date'    => now()->toDateString(),
            'due_date'      => now()->addDays(30)->toDateString(),
            'status'        => 'draft',
            'notes'         => $quote->notes,
            'currency_code' => $quote->currency_code,
            'exchange_rate' => $quote->exchange_rate ?? 1,
            'created_by'    => $quote->created_by,
        ]);

        foreach ($quote->items as $item) {
            InvoiceItem::create([
                'invoice_id'  => $invoice->id,
                'description' => $item->description,
                'quantity'    => $item->quantity,
                'unit_price'  => $item->unit_price,
                'tax_rate'    => $item->tax_rate,
            ]);
        }

        return $this->success(['invoice' => $invoice->load('items'), 'quote_number' => $quote->number]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

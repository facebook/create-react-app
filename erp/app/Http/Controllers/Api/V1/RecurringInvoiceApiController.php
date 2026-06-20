<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\RecurringInvoice;
use App\Modules\Finance\Models\RecurringInvoiceItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringInvoiceApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $invoices = RecurringInvoice::where('tenant_id', $tenantId)
            ->with('contact:id,name')
            ->withCount('invoices')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->get();

        return $this->success($invoices);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'contact_id'       => ['required', 'integer', 'exists:contacts,id'],
            'frequency'        => ['required', 'in:weekly,monthly,quarterly,yearly'],
            'interval'         => ['nullable', 'integer', 'min:1'],
            'start_date'       => ['required', 'date'],
            'end_date'         => ['nullable', 'date', 'after:start_date'],
            'due_days'         => ['nullable', 'integer', 'min:0'],
            'auto_send'        => ['boolean'],
            'currency_code'    => ['nullable', 'string', 'max:3'],
            'notes'            => ['nullable', 'string'],
            'reference_prefix' => ['nullable', 'string', 'max:20'],
            'items'            => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity'    => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price'  => ['required', 'numeric', 'min:0'],
            'items.*.tax_rate'    => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $recurring = RecurringInvoice::create([
            'tenant_id'        => $tenantId,
            'contact_id'       => $data['contact_id'],
            'frequency'        => $data['frequency'],
            'interval'         => $data['interval'] ?? 1,
            'start_date'       => $data['start_date'],
            'next_run_date'    => $data['start_date'],
            'end_date'         => $data['end_date'] ?? null,
            'due_days'         => $data['due_days'] ?? 30,
            'auto_send'        => $data['auto_send'] ?? false,
            'currency_code'    => $data['currency_code'] ?? 'USD',
            'notes'            => $data['notes'] ?? null,
            'reference_prefix' => $data['reference_prefix'] ?? 'REC-INV',
            'created_by'       => $request->user()->id,
        ]);

        foreach ($data['items'] as $item) {
            RecurringInvoiceItem::create([
                'recurring_invoice_id' => $recurring->id,
                'description'          => $item['description'],
                'quantity'             => $item['quantity'],
                'unit_price'           => $item['unit_price'],
                'tax_rate'             => $item['tax_rate'] ?? 0,
            ]);
        }

        return $this->success($recurring->load('items', 'contact:id,name'), 201);
    }

    public function show(RecurringInvoice $recurringInvoice): JsonResponse
    {
        return $this->success($recurringInvoice->load('items', 'contact:id,name', 'invoices'));
    }

    public function update(Request $request, RecurringInvoice $recurringInvoice): JsonResponse
    {
        $data = $request->validate([
            'frequency'     => ['sometimes', 'in:weekly,monthly,quarterly,yearly'],
            'interval'      => ['integer', 'min:1'],
            'end_date'      => ['nullable', 'date'],
            'due_days'      => ['integer', 'min:0'],
            'auto_send'     => ['boolean'],
            'notes'         => ['nullable', 'string'],
            'status'        => ['in:active,paused,ended,cancelled'],
        ]);

        $recurringInvoice->update($data);

        return $this->success($recurringInvoice->fresh()->load('items', 'contact:id,name'));
    }

    public function destroy(RecurringInvoice $recurringInvoice): JsonResponse
    {
        $recurringInvoice->items()->delete();
        $recurringInvoice->delete();

        return $this->success(['message' => 'Recurring invoice deleted.']);
    }

    public function pause(RecurringInvoice $recurringInvoice): JsonResponse
    {
        if ($recurringInvoice->status !== 'active') {
            return $this->error('Only active recurring invoices can be paused.', 422);
        }

        $recurringInvoice->update(['status' => 'paused']);

        return $this->success($recurringInvoice->fresh());
    }

    public function resume(RecurringInvoice $recurringInvoice): JsonResponse
    {
        if ($recurringInvoice->status !== 'paused') {
            return $this->error('Only paused recurring invoices can be resumed.', 422);
        }

        $recurringInvoice->update(['status' => 'active']);

        return $this->success($recurringInvoice->fresh());
    }

    public function generate(RecurringInvoice $recurringInvoice): JsonResponse
    {
        if ($recurringInvoice->status !== 'active') {
            return $this->error('Only active recurring invoices can generate invoices.', 422);
        }

        $invoice = $recurringInvoice->generateInvoice();

        return $this->success(['invoice' => $invoice, 'next_run_date' => $recurringInvoice->fresh()->next_run_date]);
    }

    public function due(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $due = RecurringInvoice::where('tenant_id', $tenantId)
            ->due()
            ->with('contact:id,name')
            ->withCount('invoices')
            ->get();

        return $this->success($due);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

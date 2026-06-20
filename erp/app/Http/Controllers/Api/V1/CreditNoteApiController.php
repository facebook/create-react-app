<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\CreditNote;
use App\Modules\Finance\Models\CreditNoteItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreditNoteApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $notes    = CreditNote::where('tenant_id', $tenantId)
            ->with('contact:id,name')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('contact_id'), fn ($q, $c) => $q->where('contact_id', $c))
            ->orderByDesc('issue_date')
            ->get();

        return $this->success($notes);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'contact_id'          => ['required', 'integer', 'exists:contacts,id'],
            'original_invoice_id' => ['nullable', 'integer', 'exists:invoices,id'],
            'reason'              => ['required', 'string'],
            'issue_date'          => ['required', 'date'],
            'currency_code'       => ['nullable', 'string', 'max:3'],
            'notes'               => ['nullable', 'string'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity'    => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_price'  => ['required', 'numeric', 'min:0'],
        ]);

        $ref = CreditNote::generateCreditNoteNumber();
        $creditNote = CreditNote::create([
            'tenant_id'           => $tenantId,
            'reference'           => $ref,
            'credit_note_number'  => $ref,
            'contact_id'          => $data['contact_id'],
            'original_invoice_id' => $data['original_invoice_id'] ?? null,
            'status'              => 'draft',
            'issue_date'          => $data['issue_date'],
            'reason'              => $data['reason'],
            'notes'               => $data['notes'] ?? null,
            'currency_code'       => $data['currency_code'] ?? 'USD',
            'created_by'          => $request->user()->id,
        ]);

        foreach ($data['items'] as $item) {
            CreditNoteItem::create([
                'tenant_id'      => $tenantId,
                'credit_note_id' => $creditNote->id,
                'description'    => $item['description'],
                'quantity'       => $item['quantity'],
                'unit_price'     => $item['unit_price'],
            ]);
        }

        $creditNote->recalculateTotals();

        return $this->success($creditNote->fresh()->load('items', 'contact:id,name'), 201);
    }

    public function show(CreditNote $creditNote): JsonResponse
    {
        return $this->success($creditNote->load('items', 'contact:id,name', 'invoice'));
    }

    public function update(Request $request, CreditNote $creditNote): JsonResponse
    {
        if (! $creditNote->is_open) {
            return $this->error('Only draft or issued credit notes can be updated.', 422);
        }

        $data = $request->validate([
            'reason'     => ['sometimes', 'string'],
            'notes'      => ['nullable', 'string'],
            'issue_date' => ['sometimes', 'date'],
        ]);

        $creditNote->update($data);

        return $this->success($creditNote->fresh()->load('items'));
    }

    public function destroy(CreditNote $creditNote): JsonResponse
    {
        if ($creditNote->status === 'applied') {
            return $this->error('Applied credit notes cannot be deleted.', 422);
        }

        $creditNote->items()->delete();
        $creditNote->delete();

        return $this->success(['message' => 'Credit note deleted.']);
    }

    public function issue(CreditNote $creditNote): JsonResponse
    {
        if ($creditNote->status !== 'draft') {
            return $this->error('Only draft credit notes can be issued.', 422);
        }

        $creditNote->issue();

        return $this->success($creditNote->fresh());
    }

    public function apply(CreditNote $creditNote): JsonResponse
    {
        if ($creditNote->status !== 'issued') {
            return $this->error('Only issued credit notes can be applied.', 422);
        }

        $creditNote->apply();

        return $this->success($creditNote->fresh());
    }

    public function void(CreditNote $creditNote): JsonResponse
    {
        if ($creditNote->status === 'void') {
            return $this->error('Credit note is already void.', 422);
        }

        if ($creditNote->status === 'applied') {
            return $this->error('Applied credit notes cannot be voided.', 422);
        }

        $creditNote->void();

        return $this->success($creditNote->fresh());
    }

    public function addItem(Request $request, CreditNote $creditNote): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        if (! $creditNote->is_open) {
            return $this->error('Cannot add items to a non-open credit note.', 422);
        }

        $data = $request->validate([
            'description' => ['required', 'string'],
            'quantity'    => ['required', 'numeric', 'min:0.001'],
            'unit_price'  => ['required', 'numeric', 'min:0'],
        ]);

        $item = CreditNoteItem::create([
            'tenant_id'      => $tenantId,
            'credit_note_id' => $creditNote->id,
            ...$data,
        ]);

        $creditNote->recalculateTotals();

        return $this->success($item, 201);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\DebitNote;
use App\Modules\Finance\Models\DebitNoteItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DebitNoteApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $notes    = DebitNote::where('tenant_id', $tenantId)
            ->with('vendor:id,name')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('vendor_id'), fn ($q, $v) => $q->where('vendor_id', $v))
            ->orderByDesc('issue_date')
            ->get();

        return $this->success($notes);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'vendor_id'      => ['required', 'integer', 'exists:contacts,id'],
            'vendor_bill_id' => ['nullable', 'integer', 'exists:bills,id'],
            'issue_date'     => ['required', 'date'],
            'currency'       => ['nullable', 'string', 'max:3'],
            'reason'         => ['required', 'string'],
            'items'          => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity'    => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_price'  => ['required', 'numeric', 'min:0'],
            'items.*.tax_rate'    => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $debitNote = DebitNote::create([
            'tenant_id'      => $tenantId,
            'vendor_id'      => $data['vendor_id'],
            'vendor_bill_id' => $data['vendor_bill_id'] ?? null,
            'issue_date'     => $data['issue_date'],
            'currency'       => $data['currency'] ?? 'USD',
            'reason'         => $data['reason'],
            'status'         => 'draft',
            'created_by'     => $request->user()->id,
        ]);

        foreach ($data['items'] as $item) {
            $qty   = (float) $item['quantity'];
            $price = (float) $item['unit_price'];
            $tax   = (float) ($item['tax_rate'] ?? 0);

            DebitNoteItem::create([
                'tenant_id'     => $tenantId,
                'debit_note_id' => $debitNote->id,
                'description'   => $item['description'],
                'quantity'      => $qty,
                'unit_price'    => $price,
                'tax_rate'      => $tax,
                'line_total'    => round($qty * $price, 2),
            ]);
        }

        $debitNote->recalculateTotals();

        return $this->success($debitNote->fresh()->load('items', 'vendor:id,name'), 201);
    }

    public function show(DebitNote $debitNote): JsonResponse
    {
        return $this->success($debitNote->load('items', 'vendor:id,name'));
    }

    public function update(Request $request, DebitNote $debitNote): JsonResponse
    {
        if (! $debitNote->is_open) {
            return $this->error('Only draft or issued debit notes can be updated.', 422);
        }

        $data = $request->validate([
            'reason'     => ['sometimes', 'string'],
            'issue_date' => ['sometimes', 'date'],
        ]);

        $debitNote->update($data);

        return $this->success($debitNote->fresh()->load('items'));
    }

    public function destroy(DebitNote $debitNote): JsonResponse
    {
        if ($debitNote->status === 'applied') {
            return $this->error('Applied debit notes cannot be deleted.', 422);
        }

        $debitNote->items()->delete();
        $debitNote->delete();

        return $this->success(['message' => 'Debit note deleted.']);
    }

    public function issue(DebitNote $debitNote): JsonResponse
    {
        if ($debitNote->status !== 'draft') {
            return $this->error('Only draft debit notes can be issued.', 422);
        }

        $debitNote->issue();

        return $this->success($debitNote->fresh());
    }

    public function apply(DebitNote $debitNote): JsonResponse
    {
        if ($debitNote->status !== 'issued') {
            return $this->error('Only issued debit notes can be applied.', 422);
        }

        $debitNote->apply();

        return $this->success($debitNote->fresh());
    }

    public function void(DebitNote $debitNote): JsonResponse
    {
        if ($debitNote->status === 'void') {
            return $this->error('Debit note is already void.', 422);
        }

        if ($debitNote->status === 'applied') {
            return $this->error('Applied debit notes cannot be voided.', 422);
        }

        $debitNote->void();

        return $this->success($debitNote->fresh());
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

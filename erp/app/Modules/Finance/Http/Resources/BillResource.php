<?php

namespace App\Modules\Finance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'number'        => $this->number,
            'status'        => $this->status,
            'issue_date'    => $this->issue_date?->toDateString(),
            'due_date'      => $this->due_date?->toDateString(),
            'notes'         => $this->notes,
            'is_overdue'    => $this->isOverdue(),
            'currency_code' => $this->currency_code ?? 'USD',
            'exchange_rate' => $this->exchange_rate ?? 1.0,
            'contact'       => $this->whenLoaded('contact', fn () => $this->contact ? [
                'id' => $this->contact->id, 'name' => $this->contact->name,
            ] : null),
            'items'         => $this->whenLoaded('items', fn () => $this->items->map(fn ($i) => [
                'id'          => $i->id,
                'description' => $i->description,
                'quantity'    => $i->quantity,
                'unit_price'  => $i->unit_price,
                'tax_rate'    => $i->tax_rate,
                'subtotal'    => $i->subtotal,
                'tax'         => $i->tax,
                'line_total'  => $i->line_total,
            ])),
            'payments'      => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($p) => [
                'id'           => $p->id,
                'amount'       => $p->amount,
                'payment_date' => $p->payment_date?->toDateString(),
                'method'       => $p->method,
                'reference'    => $p->reference,
            ])),
            'subtotal'      => $this->whenLoaded('items', fn () => $this->subtotal),
            'tax_total'     => $this->whenLoaded('items', fn () => $this->tax_total),
            'total'         => $this->whenLoaded('items', fn () => $this->total),
            'base_total'    => $this->whenLoaded('items', fn () => $this->base_total),
            'amount_paid'   => $this->whenLoaded('payments', fn () => $this->amount_paid),
            'amount_due'    => $this->when(
                $this->relationLoaded('items') && $this->relationLoaded('payments'),
                fn () => $this->amount_due
            ),
            'transitions'   => $this->availableTransitions(),
            'attachments'   => $this->whenLoaded('attachments', fn () => $this->attachments->map(fn ($a) => [
                'id' => $a->id, 'filename' => $a->filename, 'disk' => $a->disk,
                'path' => $a->path, 'mime_type' => $a->mime_type, 'size' => $a->size,
                'uploaded_by' => $a->uploaded_by, 'created_at' => $a->created_at?->toIso8601String(),
            ])),
            'creator'       => $this->whenLoaded('creator', fn () => $this->creator?->name),
            'created_at'    => $this->created_at?->toDateString(),
        ];
    }
}

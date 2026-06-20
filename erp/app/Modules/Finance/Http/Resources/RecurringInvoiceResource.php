<?php

namespace App\Modules\Finance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecurringInvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'contact'           => $this->whenLoaded('contact', fn () => $this->contact ? [
                'id' => $this->contact->id, 'name' => $this->contact->name,
            ] : null),
            'reference_prefix'  => $this->reference_prefix,
            'frequency'         => $this->frequency,
            'interval'          => $this->interval,
            'start_date'        => $this->start_date?->toDateString(),
            'next_run_date'     => $this->next_run_date?->toDateString(),
            'end_date'          => $this->end_date?->toDateString(),
            'due_days'          => $this->due_days,
            'status'            => $this->status,
            'auto_send'         => (bool) $this->auto_send,
            'currency_code'     => $this->currency_code,
            'exchange_rate'     => $this->exchange_rate,
            'notes'             => $this->notes,
            'last_generated_at' => $this->last_generated_at,
            'generated_count'   => $this->generated_count,
            'items'             => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id'          => $item->id,
                'description' => $item->description,
                'quantity'    => $item->quantity,
                'unit_price'  => $item->unit_price,
                'tax_rate'    => $item->tax_rate,
                'line_total'  => $item->line_total,
            ])),
            'subtotal'          => $this->whenLoaded('items', fn () => $this->subtotal),
            'tax_total'         => $this->whenLoaded('items', fn () => $this->tax_total),
            'total'             => $this->whenLoaded('items', fn () => $this->total),
            'created_by'        => $this->whenLoaded('creator', fn () => $this->creator?->name),
            'created_at'        => $this->created_at,
        ];
    }
}

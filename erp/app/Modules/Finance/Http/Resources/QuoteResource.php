<?php

namespace App\Modules\Finance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'number'        => $this->number,
            'status'        => $this->status,
            'issue_date'    => $this->issue_date?->toDateString(),
            'expiry_date'   => $this->expiry_date?->toDateString(),
            'notes'         => $this->notes,
            'currency_code' => $this->currency_code ?? 'USD',
            'exchange_rate' => $this->exchange_rate ?? 1.0,
            'contact'       => $this->whenLoaded('contact', fn () => $this->contact ? [
                'id' => $this->contact->id, 'name' => $this->contact->name,
            ] : null),
            'items'         => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id'          => $item->id,
                'description' => $item->description,
                'quantity'    => $item->quantity,
                'unit_price'  => $item->unit_price,
                'tax_rate'    => $item->tax_rate,
                'line_total'  => $item->line_total,
            ])),
            'subtotal'      => $this->whenLoaded('items', fn () => $this->subtotal),
            'tax_total'     => $this->whenLoaded('items', fn () => $this->tax_total),
            'total'         => $this->whenLoaded('items', fn () => $this->total),
            'base_total'    => $this->whenLoaded('items', fn () => $this->base_total),
            'transitions'   => $this->availableTransitions(),
            'created_by'    => $this->whenLoaded('creator', fn () => $this->creator?->name),
            'created_at'    => $this->created_at,
        ];
    }
}

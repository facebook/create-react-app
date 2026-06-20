<?php

namespace App\Modules\Finance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'number'        => $this->number,
            'status'        => $this->status,
            'order_date'    => $this->order_date?->toDateString(),
            'expected_date' => $this->expected_date?->toDateString(),
            'notes'         => $this->notes,
            'contact'       => $this->whenLoaded('contact', fn () => $this->contact ? [
                'id' => $this->contact->id, 'name' => $this->contact->name,
            ] : null),
            'warehouse'     => $this->whenLoaded('warehouse', fn () => $this->warehouse ? [
                'id' => $this->warehouse->id, 'name' => $this->warehouse->name,
            ] : null),
            'invoice'       => $this->whenLoaded('invoice', fn () => $this->invoice ? [
                'id' => $this->invoice->id, 'number' => $this->invoice->number,
            ] : null),
            'items'         => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id'                 => $item->id,
                'product_id'         => $item->product_id,
                'product_name'       => $item->product?->name,
                'product_sku'        => $item->product?->sku,
                'description'        => $item->description,
                'quantity'           => $item->quantity,
                'unit_price'         => $item->unit_price,
                'tax_rate'           => $item->tax_rate,
                'quantity_fulfilled' => $item->quantity_fulfilled,
                'line_total'         => $item->line_total,
            ])),
            'subtotal'      => $this->whenLoaded('items', fn () => $this->subtotal),
            'tax_total'     => $this->whenLoaded('items', fn () => $this->tax_total),
            'total'         => $this->whenLoaded('items', fn () => $this->total),
            'transitions'   => $this->availableTransitions(),
            'created_by'    => $this->whenLoaded('creator', fn () => $this->creator?->name),
            'created_at'    => $this->created_at,
        ];
    }
}

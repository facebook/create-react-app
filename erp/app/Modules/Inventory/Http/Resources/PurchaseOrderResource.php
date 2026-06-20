<?php

namespace App\Modules\Inventory\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'status'        => $this->status,
            'expected_date' => $this->expected_date?->toDateString(),
            'notes'         => $this->notes,
            'total'         => $this->total,
            'supplier'      => $this->whenLoaded('supplier', fn () => [
                'id'   => $this->supplier->id,
                'name' => $this->supplier->name,
            ]),
            'warehouse'     => $this->whenLoaded('warehouse', fn () => [
                'id'   => $this->warehouse->id,
                'name' => $this->warehouse->name,
            ]),
            'items'         => $this->whenLoaded('items', fn () =>
                $this->items->map(fn ($item) => [
                    'id'                => $item->id,
                    'product_id'        => $item->product_id,
                    'product_name'      => $item->product?->name,
                    'product_sku'       => $item->product?->sku,
                    'quantity'          => $item->quantity,
                    'unit_cost'         => $item->unit_cost,
                    'received_quantity' => $item->received_quantity,
                    'line_total'        => $item->line_total,
                ])
            ),
            'created_by'    => $this->whenLoaded('creator', fn () => $this->creator?->name),
            'created_at'    => $this->created_at,
        ];
    }
}

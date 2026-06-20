<?php

namespace App\Listeners\Manufacturing;

use App\Events\Manufacturing\ManufacturingOrderCompleted;
use App\Modules\Inventory\Models\StockMovement;

class UpdateInventoryForManufacturingOrder
{
    public function handle(ManufacturingOrderCompleted $event): void
    {
        $order = $event->order;

        if (! $order->warehouse_id) {
            return;
        }

        StockMovement::create([
            'tenant_id'    => $order->tenant_id,
            'product_id'   => $order->product_id,
            'warehouse_id' => $order->warehouse_id,
            'type'         => 'in',
            'quantity'     => $order->qty_produced,
            'reference'    => 'MO-COMPLETION-' . $order->mo_number,
            'notes'        => 'Finished goods from manufacturing order ' . $order->mo_number,
        ]);
    }
}

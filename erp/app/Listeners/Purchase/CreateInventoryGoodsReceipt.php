<?php

namespace App\Listeners\Purchase;

use App\Events\Purchase\PurchaseOrderConfirmed;
use App\Modules\Inventory\Models\GoodsReceipt;
use App\Modules\Inventory\Models\GoodsReceiptItem;

class CreateInventoryGoodsReceipt
{
    public function handle(PurchaseOrderConfirmed $event): void
    {
        $po = $event->po;

        $vendorName = $po->relationLoaded('vendor') && $po->vendor
            ? $po->vendor->name
            : 'Purchase Order';

        $receipt = GoodsReceipt::create([
            'tenant_id'      => $po->tenant_id,
            'receipt_number' => 'GR-' . $po->po_number,
            'supplier_name'  => $vendorName,
            'receipt_date'   => now()->toDateString(),
            'status'         => 'draft',
        ]);

        foreach ($po->lines as $line) {
            GoodsReceiptItem::create([
                'goods_receipt_id'  => $receipt->id,
                'quantity_expected' => $line->quantity,
                'quantity_received' => 0,
                'unit_cost'         => $line->unit_price,
                'notes'             => $line->product_name,
            ]);
        }
    }
}

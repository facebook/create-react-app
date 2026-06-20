<?php

namespace App\Listeners\Inventory;

use App\Events\Inventory\InventoryStockLow;
use App\Jobs\ProcessLowStockAlertJob;
use App\Mail\LowStockAlertMail;
use App\Modules\Purchase\Models\PurchaseRfq;
use App\Modules\Purchase\Models\PurchaseRfqLine;
use Illuminate\Support\Facades\Mail;

class CreatePurchaseRfqFromLowStock
{
    public function handle(InventoryStockLow $event): void
    {
        $product     = $event->product;
        $reorderRule = $event->reorderRule;

        $vendor = \App\Modules\Purchase\Models\PurchaseVendor::where('tenant_id', $product->tenant_id)
            ->where('is_active', true)
            ->first();

        if (! $vendor) {
            $vendor = \App\Modules\Purchase\Models\PurchaseVendor::create([
                'tenant_id' => $product->tenant_id,
                'name'      => 'Default Vendor',
                'currency'  => 'USD',
                'is_active' => true,
            ]);
        }

        $rfq = PurchaseRfq::create([
            'tenant_id'   => $product->tenant_id,
            'rfq_number'  => 'RFQ-AUTO-' . now()->format('YmdHis') . '-' . uniqid(),
            'po_vendor_id' => $vendor->id,
            'status'      => 'draft',
            'currency'    => 'USD',
            'notes'       => 'Auto-created from low stock alert for: ' . $product->name,
        ]);

        PurchaseRfqLine::create([
            'tenant_id'    => $product->tenant_id,
            'po_rfq_id'    => $rfq->id,
            'product_name' => $product->name,
            'quantity'     => $reorderRule->reorder_quantity,
            'unit_price'   => 0,
            'subtotal'     => 0,
        ]);

        $reorderRule->trigger();

        ProcessLowStockAlertJob::dispatch($product, (int) ($event->stockLevel->quantity ?? 0));

        Mail::to('purchasing@example.com')->queue(new LowStockAlertMail(
            $product->name,
            (float) ($event->stockLevel->quantity ?? 0),
            (float) $reorderRule->reorder_point,
        ));
    }
}

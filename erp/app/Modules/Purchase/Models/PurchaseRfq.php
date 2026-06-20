<?php

namespace App\Modules\Purchase\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRfq extends Model
{
    use BelongsToTenant;

    protected $table = 'po_rfqs';

    protected $fillable = [
        'tenant_id',
        'rfq_number',
        'po_vendor_id',
        'status',
        'expected_delivery',
        'notes',
        'currency',
        'sent_at',
    ];

    protected $casts = [
        'expected_delivery' => 'date',
        'sent_at'           => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(PurchaseVendor::class, 'po_vendor_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(PurchaseRfqLine::class, 'po_rfq_id');
    }

    public function send(): void
    {
        $this->update([
            'status'  => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public function toPurchaseOrder(): Po
    {
        $po = Po::create([
            'tenant_id'    => $this->tenant_id,
            'po_number'    => Po::generatePoNumber(),
            'po_rfq_id'    => $this->id,
            'po_vendor_id' => $this->po_vendor_id,
            'status'       => 'draft',
            'order_date'   => now()->toDateString(),
            'expected_delivery' => $this->expected_delivery?->toDateString(),
            'notes'        => $this->notes,
            'currency'     => $this->currency,
            'total_amount' => 0,
        ]);

        $total = 0;
        foreach ($this->lines as $line) {
            PoLine::create([
                'tenant_id'    => $this->tenant_id,
                'po_id'        => $po->id,
                'product_name' => $line->product_name,
                'description'  => $line->description,
                'quantity'     => $line->quantity,
                'unit_price'   => $line->unit_price,
                'uom'          => $line->uom,
                'subtotal'     => $line->subtotal,
                'received_qty' => 0,
            ]);
            $total += $line->subtotal;
        }

        $po->update(['total_amount' => $total]);

        return $po;
    }
}

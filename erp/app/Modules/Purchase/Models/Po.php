<?php

namespace App\Modules\Purchase\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Po extends Model
{
    use BelongsToTenant;

    protected $table = 'pos';

    protected $fillable = [
        'tenant_id',
        'po_number',
        'po_rfq_id',
        'po_vendor_id',
        'status',
        'order_date',
        'expected_delivery',
        'notes',
        'currency',
        'total_amount',
        'confirmed_at',
        'received_at',
    ];

    protected $casts = [
        'order_date'        => 'date',
        'expected_delivery' => 'date',
        'confirmed_at'      => 'datetime',
        'received_at'       => 'datetime',
        'total_amount'      => 'decimal:2',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(PurchaseVendor::class, 'po_vendor_id');
    }

    public function rfq(): BelongsTo
    {
        return $this->belongsTo(PurchaseRfq::class, 'po_rfq_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(PoLine::class, 'po_id');
    }

    public function confirm(): void
    {
        $this->update([
            'status'       => 'confirmed',
            'confirmed_at' => now(),
        ]);
        event(new \App\Events\Purchase\PurchaseOrderConfirmed($this));
    }

    public function receive(): void
    {
        $this->update([
            'status'      => 'received',
            'received_at' => now(),
        ]);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public static function generatePoNumber(): string
    {
        return 'PO-' . now()->format('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    }
}

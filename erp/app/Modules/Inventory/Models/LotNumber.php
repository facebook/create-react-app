<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LotNumber extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'warehouse_id',
        'lot_number',
        'manufacture_date',
        'expiry_date',
        'quantity_received',
        'quantity_remaining',
        'status',
        'notes',
    ];

    protected $casts = [
        'manufacture_date'    => 'date',
        'expiry_date'         => 'date',
        'quantity_received'   => 'integer',
        'quantity_remaining'  => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function serialNumbers(): HasMany
    {
        return $this->hasMany(SerialNumber::class, 'lot_number_id');
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date !== null && $this->expiry_date->isPast();
    }

    public function getIsExpiringAttribute(): bool
    {
        return $this->expiry_date !== null
            && $this->expiry_date->isFuture()
            && $this->expiry_date->diffInDays(now()) <= 30;
    }

    public function quarantine(?string $reason = null): void
    {
        $this->status = 'quarantine';
        if ($reason !== null) {
            $this->notes = $reason;
        }
        $this->save();
    }

    public function consume(int $qty): void
    {
        $this->quantity_remaining = max(0, $this->quantity_remaining - $qty);
        if ($this->quantity_remaining <= 0) {
            $this->status = 'consumed';
        }
        $this->save();
    }
}

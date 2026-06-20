<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockReservation extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'reservation_number',
        'reference_type',
        'reference_id',
        'quantity',
        'quantity_fulfilled',
        'reserved_until',
        'status',
        'notes',
        'reserved_by',
    ];

    protected $attributes = [
        'status'              => 'active',
        'quantity_fulfilled'  => 0,
    ];

    protected $casts = [
        'quantity'           => 'decimal:2',
        'quantity_fulfilled' => 'decimal:2',
        'reserved_until'     => 'date',
    ];

    // Relations

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Mutating methods

    public function fulfill(float $quantity): void
    {
        $this->quantity_fulfilled = (float) $this->quantity_fulfilled + $quantity;
        if ((float) $this->quantity_fulfilled >= (float) $this->quantity) {
            $this->status = 'fulfilled';
        }
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function expire(): void
    {
        $this->status = 'expired';
        $this->save();
    }

    public function generateReservationNumber(): string
    {
        return 'SR-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    // Accessors

    public function getQuantityRemainingAttribute(): float
    {
        return max(0, (float) $this->quantity - (float) $this->quantity_fulfilled);
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getIsFulfilledAttribute(): bool
    {
        return $this->status === 'fulfilled';
    }

    public function getIsExpiredAttribute(): bool
    {
        if ($this->status === 'expired') {
            return true;
        }

        if ($this->status === 'active' && $this->reserved_until !== null) {
            return $this->reserved_until->lt(now()->startOfDay());
        }

        return false;
    }
}

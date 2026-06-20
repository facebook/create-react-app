<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Backorder extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'backorder_number',
        'product_id',
        'warehouse_id',
        'customer_id',
        'quantity_ordered',
        'quantity_fulfilled',
        'status',
        'expected_date',
        'notes',
    ];

    protected $attributes = [
        'status'              => 'pending',
        'quantity_fulfilled'  => 0,
    ];

    protected $casts = [
        'quantity_ordered'   => 'float',
        'quantity_fulfilled' => 'float',
        'expected_date'      => 'date',
    ];

    public function generateBackorderNumber(): string
    {
        return 'BO-' . now()->year . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function fulfill(float $quantity): void
    {
        $this->quantity_fulfilled += $quantity;

        if ($this->quantity_fulfilled >= $this->quantity_ordered) {
            $this->status = 'fulfilled';
        } else {
            $this->status = 'partial';
        }

        if ($this->backorder_number === null) {
            $this->backorder_number = $this->generateBackorderNumber();
        }

        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function getQuantityRemainingAttribute(): float
    {
        return (float) $this->quantity_ordered - (float) $this->quantity_fulfilled;
    }

    public function getIsPendingAttribute(): bool
    {
        return in_array($this->status, ['pending', 'partial']);
    }

    public function getIsFulfilledAttribute(): bool
    {
        return $this->status === 'fulfilled';
    }
}

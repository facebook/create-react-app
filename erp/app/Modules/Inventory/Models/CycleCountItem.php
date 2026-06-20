<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CycleCountItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'cycle_count_id', 'product_id', 'system_qty', 'counted_qty', 'notes',
    ];

    protected $casts = [
        'system_qty'  => 'float',
        'counted_qty' => 'float',
    ];

    public function cycleCount(): BelongsTo
    {
        return $this->belongsTo(CycleCount::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getVarianceAttribute(): float
    {
        return ($this->counted_qty ?? $this->system_qty) - $this->system_qty;
    }

    public function getIsCountedAttribute(): bool
    {
        return $this->counted_qty !== null;
    }
}

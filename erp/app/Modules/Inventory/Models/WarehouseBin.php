<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WarehouseBin extends Model
{
    use BelongsToTenant;

    protected $table = 'warehouse_bins';

    protected $fillable = [
        'tenant_id',
        'warehouse_id',
        'zone_id',
        'code',
        'name',
        'bin_type',
        'capacity',
        'is_active',
    ];

    protected $casts = [
        'capacity'  => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(WarehouseZone::class, 'zone_id');
    }

    public function stockLocations(): HasMany
    {
        return $this->hasMany(BinStockLocation::class, 'bin_id');
    }

    public function getUsedCapacityAttribute(): float
    {
        return (float) $this->stockLocations->sum('quantity');
    }

    public function getAvailableCapacityAttribute(): ?float
    {
        if ($this->capacity === null) {
            return null;
        }

        return max(0, (float) $this->capacity - $this->used_capacity);
    }
}

<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WarehouseStock extends Model
{
    use BelongsToTenant;

    protected $table = 'warehouse_stock';

    protected $fillable = [
        'tenant_id',
        'warehouse_id',
        'product_id',
        'quantity',
        'reorder_point',
    ];

    protected $casts = [
        'quantity'      => 'decimal:4',
        'reorder_point' => 'decimal:4',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getIsBelowReorderPointAttribute(): bool
    {
        if ($this->reorder_point === null) {
            return false;
        }

        return (float) $this->quantity < (float) $this->reorder_point;
    }
}

<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class StockTransfer extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'reference',
        'from_warehouse_id',
        'to_warehouse_id',
        'status',
        'notes',
        'transferred_at',
    ];

    protected $casts = [
        'transferred_at' => 'datetime',
    ];

    public function fromWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockTransferItem::class);
    }

    public function complete(): void
    {
        $this->loadMissing('items');

        foreach ($this->items as $item) {
            // Decrement from source
            $fromStock = WarehouseStock::firstOrCreate(
                [
                    'tenant_id'    => $this->tenant_id,
                    'warehouse_id' => $this->from_warehouse_id,
                    'product_id'   => $item->product_id,
                ],
                ['quantity' => 0]
            );
            $fromStock->decrement('quantity', $item->quantity);

            // Increment at destination
            $toStock = WarehouseStock::firstOrCreate(
                [
                    'tenant_id'    => $this->tenant_id,
                    'warehouse_id' => $this->to_warehouse_id,
                    'product_id'   => $item->product_id,
                ],
                ['quantity' => 0]
            );
            $toStock->increment('quantity', $item->quantity);
        }

        $this->status         = 'completed';
        $this->transferred_at = Carbon::now();
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }
}

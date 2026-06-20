<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockAdjustment extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'warehouse_id', 'reference', 'reason', 'status',
        'adjusted_by', 'confirmed_at', 'notes',
    ];

    protected $casts = ['confirmed_at' => 'datetime'];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function adjuster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockAdjustmentItem::class);
    }

    /**
     * Confirm the adjustment: create stock movements for each item with a difference.
     */
    public function confirm(User $user): void
    {
        abort_unless($this->status === 'draft', 422, 'Only draft adjustments can be confirmed.');
        $this->load('items.product', 'warehouse');

        foreach ($this->items as $item) {
            if ($item->difference == 0) {
                continue;
            }

            $type = $item->difference > 0 ? 'in' : 'out';

            StockMovement::record([
                'product_id'   => $item->product_id,
                'warehouse_id' => $this->warehouse_id,
                'type'         => $type,
                'quantity'     => abs((float) $item->difference),
                'reference'    => $this->reference,
            ]);
        }

        $this->update([
            'status'       => 'confirmed',
            'adjusted_by'  => $user->id,
            'confirmed_at' => now(),
        ]);
    }
}

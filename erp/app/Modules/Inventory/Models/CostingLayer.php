<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CostingLayer extends Model
{
    use BelongsToTenant;

    protected $table = 'costing_layers';

    protected $fillable = [
        'tenant_id',
        'product_id',
        'warehouse_id',
        'costing_method',
        'quantity_received',
        'quantity_remaining',
        'unit_cost',
        'received_at',
        'reference_type',
        'reference_id',
    ];

    protected $casts = [
        'quantity_received'  => 'decimal:4',
        'quantity_remaining' => 'decimal:4',
        'unit_cost'          => 'decimal:4',
        'received_at'        => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function scopeForProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeWithRemaining($query)
    {
        return $query->where('quantity_remaining', '>', 0);
    }

    public function scopeFifo($query)
    {
        return $query->orderBy('received_at', 'asc');
    }

    public static function getAverageCost(int $tenantId, int $productId): float
    {
        $layers = static::withoutGlobalScope('tenant')
            ->where('tenant_id', $tenantId)
            ->where('product_id', $productId)
            ->where('quantity_remaining', '>', 0)
            ->get();

        $totalQty   = $layers->sum(fn ($l) => (float) $l->quantity_remaining);
        $totalValue = $layers->sum(fn ($l) => (float) $l->quantity_remaining * (float) $l->unit_cost);

        if ($totalQty <= 0) {
            return 0.0;
        }

        return $totalValue / $totalQty;
    }

    public static function consumeFifo(int $tenantId, int $productId, float $quantity): float
    {
        $layers = static::withoutGlobalScope('tenant')
            ->where('tenant_id', $tenantId)
            ->where('product_id', $productId)
            ->where('quantity_remaining', '>', 0)
            ->orderBy('received_at', 'asc')
            ->get();

        $needed    = $quantity;
        $totalCost = 0.0;

        foreach ($layers as $layer) {
            if ($needed <= 0) {
                break;
            }

            $layerRemaining = (float) $layer->quantity_remaining;
            $unitCost       = (float) $layer->unit_cost;

            if ($layerRemaining >= $needed) {
                $totalCost += $needed * $unitCost;
                $layer->quantity_remaining = $layerRemaining - $needed;
                $layer->save();
                $needed = 0;
                break;
            } else {
                $totalCost += $layerRemaining * $unitCost;
                $needed    -= $layerRemaining;
                $layer->quantity_remaining = 0;
                $layer->save();
            }
        }

        return $totalCost;
    }
}

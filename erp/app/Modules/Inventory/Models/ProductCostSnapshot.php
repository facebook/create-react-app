<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductCostSnapshot extends Model
{
    use BelongsToTenant;

    protected $table = 'product_cost_snapshots';

    protected $fillable = [
        'tenant_id',
        'product_id',
        'costing_method',
        'average_cost',
        'fifo_cost',
        'snapshot_date',
        'total_quantity',
        'total_value',
    ];

    protected $casts = [
        'average_cost'   => 'decimal:4',
        'fifo_cost'      => 'decimal:4',
        'total_quantity' => 'decimal:4',
        'total_value'    => 'decimal:4',
        'snapshot_date'  => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public static function takeSnapshot(int $tenantId, int $productId): self
    {
        $averageCost = CostingLayer::getAverageCost($tenantId, $productId);

        // FIFO cost is the unit cost of the oldest remaining layer
        $oldestLayer = CostingLayer::withoutGlobalScope('tenant')
            ->where('tenant_id', $tenantId)
            ->where('product_id', $productId)
            ->where('quantity_remaining', '>', 0)
            ->orderBy('received_at', 'asc')
            ->first();

        $fifoCost = $oldestLayer ? (float) $oldestLayer->unit_cost : 0.0;

        $layers = CostingLayer::withoutGlobalScope('tenant')
            ->where('tenant_id', $tenantId)
            ->where('product_id', $productId)
            ->where('quantity_remaining', '>', 0)
            ->get();

        $totalQuantity = $layers->sum(fn ($l) => (float) $l->quantity_remaining);
        $totalValue    = $layers->sum(fn ($l) => (float) $l->quantity_remaining * (float) $l->unit_cost);

        return static::create([
            'tenant_id'      => $tenantId,
            'product_id'     => $productId,
            'costing_method' => 'fifo',
            'average_cost'   => $averageCost,
            'fifo_cost'      => $fifoCost,
            'snapshot_date'  => now()->toDateString(),
            'total_quantity' => $totalQuantity,
            'total_value'    => $totalValue,
        ]);
    }
}

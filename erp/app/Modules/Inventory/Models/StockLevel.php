<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockLevel extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'product_id', 'warehouse_id',
        'quantity', 'reserved_quantity',
    ];

    protected $casts = [
        'quantity'          => 'decimal:2',
        'reserved_quantity' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function getAvailableAttribute(): float
    {
        return (float) $this->quantity - (float) $this->reserved_quantity;
    }

    public function checkReorderRules(): void
    {
        $rules = \App\Modules\Inventory\Models\ReorderRule::where('product_id', $this->product_id)
            ->where('is_active', true)
            ->where('status', 'active')
            ->get();

        foreach ($rules as $rule) {
            if ((float) $this->quantity <= (float) $rule->reorder_point) {
                $product = $this->product ?? \App\Modules\Inventory\Models\Product::find($this->product_id);
                if ($product) {
                    event(new \App\Events\Inventory\InventoryStockLow($product, $this, $rule));
                }
            }
        }
    }
}

<?php

namespace App\Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceiptItem extends Model
{
    protected $fillable = [
        'goods_receipt_id',
        'product_id',
        'quantity_expected',
        'quantity_received',
        'unit_cost',
        'condition',
        'notes',
    ];

    protected $casts = [
        'quantity_expected' => 'decimal:2',
        'quantity_received' => 'decimal:2',
        'unit_cost'         => 'decimal:2',
    ];

    protected $attributes = [
        'condition'         => 'good',
        'quantity_expected' => 0,
        'quantity_received' => 0,
        'unit_cost'         => 0,
    ];

    // Relations

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class, 'goods_receipt_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors

    protected function lineTotal(): Attribute
    {
        return Attribute::make(
            get: fn () => (float) $this->quantity_received * (float) $this->unit_cost,
        );
    }
}

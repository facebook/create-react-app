<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesOrderItem extends Model
{
    protected $table = 'sales_order_items';

    protected $fillable = [
        'sales_order_id', 'product_id', 'description',
        'quantity', 'unit_price', 'tax_rate', 'line_total', 'quantity_fulfilled',
    ];

    protected $casts = [
        'quantity'           => 'decimal:2',
        'unit_price'         => 'decimal:2',
        'tax_rate'           => 'decimal:2',
        'quantity_fulfilled' => 'decimal:2',
    ];

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Inventory\Models\Product::class);
    }

    public function getLineTotalAttribute(): float
    {
        return (float) $this->quantity * (float) $this->unit_price * (1 + (float) $this->tax_rate / 100);
    }
}

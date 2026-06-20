<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesOrderItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'sales_order_id', 'product_id', 'description',
        'quantity', 'unit_price', 'shipped_qty',
    ];

    protected $casts = [
        'quantity'    => 'float',
        'unit_price'  => 'float',
        'shipped_qty' => 'float',
    ];

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getLineTotalAttribute(): float
    {
        return (float) $this->quantity * (float) $this->unit_price;
    }
}

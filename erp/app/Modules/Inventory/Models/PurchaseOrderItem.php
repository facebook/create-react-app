<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'purchase_order_id', 'product_id', 'description',
        'quantity', 'unit_price', 'received_qty',
    ];

    protected $casts = [
        'quantity'     => 'float',
        'unit_price'   => 'float',
        'received_qty' => 'float',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getLineTotalAttribute(): float
    {
        return (float) $this->quantity * (float) $this->unit_price;
    }

    public function getIsFullyReceivedAttribute(): bool
    {
        return $this->received_qty >= $this->quantity;
    }
}

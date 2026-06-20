<?php

namespace App\Modules\Repairs\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairLine extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'repair_order_id',
        'line_type',
        'product_id',
        'description',
        'quantity',
        'unit_price',
        'total',
        'is_invoiced',
    ];

    protected $casts = [
        'quantity'    => 'decimal:2',
        'unit_price'  => 'decimal:2',
        'total'       => 'decimal:2',
        'is_invoiced' => 'boolean',
    ];

    public function repairOrder(): BelongsTo
    {
        return $this->belongsTo(RepairOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Inventory\Models\Product::class);
    }
}

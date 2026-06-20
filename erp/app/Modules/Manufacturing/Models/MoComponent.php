<?php

namespace App\Modules\Manufacturing\Models;

use App\Modules\Inventory\Models\Product;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MoComponent extends Model
{
    protected $table = 'mo_components';

    protected $fillable = [
        'manufacturing_order_id', 'product_id', 'qty_required',
        'qty_consumed', 'uom', 'is_available',
    ];

    protected $casts = [
        'qty_required' => 'float',
        'qty_consumed' => 'float',
        'is_available' => 'boolean',
    ];

    public function manufacturingOrder(): BelongsTo
    {
        return $this->belongsTo(ManufacturingOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected function remainingQty(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->qty_required - $this->qty_consumed
        );
    }
}

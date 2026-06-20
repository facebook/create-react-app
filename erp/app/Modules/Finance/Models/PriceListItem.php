<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceListItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'price_list_id', 'product_id', 'unit_price', 'min_quantity',
    ];

    protected $casts = [
        'unit_price'   => 'decimal:4',
        'min_quantity' => 'integer',
    ];

    public function priceList(): BelongsTo
    {
        return $this->belongsTo(PriceList::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Inventory\Models\Product::class);
    }
}

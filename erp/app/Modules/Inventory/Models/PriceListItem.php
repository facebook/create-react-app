<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceListItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'price_list_id', 'product_id', 'price', 'min_quantity',
    ];

    protected $casts = [
        'price'        => 'float',
        'min_quantity' => 'float',
    ];

    public function priceList(): BelongsTo
    {
        return $this->belongsTo(PriceList::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

<?php

namespace App\Modules\Ecommerce\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Inventory\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreProduct extends Model
{
    use BelongsToTenant;

    protected $table = 'store_products';

    protected $fillable = [
        'tenant_id',
        'product_id',
        'category_id',
        'store_price',
        'compare_price',
        'is_featured',
        'is_visible',
        'sort_order',
        'short_description',
        'long_description',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'store_price'   => 'float',
        'compare_price' => 'float',
        'is_featured'   => 'boolean',
        'is_visible'    => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(StoreCategory::class, 'category_id');
    }

    public function isOnSale(): bool
    {
        return $this->compare_price !== null && $this->compare_price > $this->store_price;
    }

    public function discountPercent(): int
    {
        if (! $this->isOnSale()) {
            return 0;
        }

        return (int) round(($this->compare_price - $this->store_price) / $this->compare_price * 100);
    }
}

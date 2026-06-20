<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PriceList extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'description', 'currency_code',
        'discount_percent', 'is_active',
        'is_default', 'valid_from', 'valid_to',
    ];

    protected $casts = [
        'discount_percent' => 'float',
        'is_active'        => 'boolean',
        'is_default'       => 'boolean',
        'valid_from'       => 'date',
        'valid_to'         => 'date',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(PriceListItem::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class, 'price_list_id');
    }

    public static function getDefault(int $tenantId): ?self
    {
        return static::where('is_default', true)
            ->where('tenant_id', $tenantId)
            ->first();
    }

    public function getPriceForProduct(int $productId, int $quantity = 1): ?float
    {
        $item = $this->items()
            ->where('product_id', $productId)
            ->where('min_quantity', '<=', $quantity)
            ->orderBy('min_quantity', 'desc')
            ->first();

        return $item ? (float) $item->unit_price : null;
    }

    public static function priceFor(int $priceListId, int $productId, float $defaultPrice): float
    {
        // First check for a product-specific override
        $item = PriceListItem::where('price_list_id', $priceListId)
            ->where('product_id', $productId)
            ->first();
        if ($item) return (float) $item->unit_price;

        // Fall back to global discount
        $list = static::find($priceListId);
        if ($list && $list->discount_percent > 0) {
            return round($defaultPrice * (1 - $list->discount_percent / 100), 4);
        }

        return $defaultPrice;
    }
}

<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductBundle extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $attributes = [
        'is_active' => true,
    ];

    protected $fillable = [
        'tenant_id',
        'name',
        'sku',
        'description',
        'bundle_price',
        'is_active',
    ];

    protected $casts = [
        'bundle_price' => 'float',
        'is_active'    => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ProductBundleItem::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_bundle_items')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function calculatePrice(): float
    {
        if (! is_null($this->bundle_price)) {
            return (float) $this->bundle_price;
        }

        return (float) $this->items->sum(function ($item) {
            $product = $item->product;
            if ($product === null) {
                return 0;
            }
            $price = isset($product->sale_price) ? (float) $product->sale_price : 0.0;
            return $price * (float) $item->quantity;
        });
    }

    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    public function getItemCountAttribute(): int
    {
        return $this->items()->count();
    }
}

<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'product_id', 'sku', 'name',
        'price_adjustment', 'stock_quantity', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean', 'price_adjustment' => 'float', 'stock_quantity' => 'integer'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function values(): HasMany
    {
        return $this->hasMany(ProductVariantValue::class, 'variant_id');
    }

    public function getEffectivePriceAttribute(): float
    {
        return (float) ($this->product?->sale_price ?? 0) + (float) $this->price_adjustment;
    }

    public function adjustStock(int $delta): void
    {
        $this->stock_quantity = max(0, $this->stock_quantity + $delta);
        $this->save();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

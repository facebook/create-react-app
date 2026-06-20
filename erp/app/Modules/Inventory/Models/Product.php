<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use BelongsToTenant;
    use HasAuditLog;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'sku', 'name', 'description',
        'category_id', 'uom_id', 'cost_price',
        'sale_price', 'reorder_point', 'reorder_quantity',
        'preferred_supplier_id', 'is_active', 'is_bundle', 'stock_quantity',
    ];

    protected $casts = [
        'cost_price'           => 'decimal:2',
        'sale_price'           => 'decimal:2',
        'reorder_point'        => 'float',
        'reorder_quantity'     => 'float',
        'is_active'            => 'boolean',
        'is_bundle'            => 'boolean',
        'stock_quantity'       => 'decimal:4',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'uom_id');
    }

    public function stockLevels(): HasMany
    {
        return $this->hasMany(StockLevel::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function preferredSupplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'preferred_supplier_id');
    }

    public function bundleItems(): HasMany
    {
        return $this->hasMany(ProductBundleItem::class, 'bundle_product_id');
    }

    public function componentInBundles(): HasMany
    {
        return $this->hasMany(ProductBundleItem::class, 'component_product_id');
    }

    public function getStockSufficientForBundleAttribute(): bool
    {
        if (! $this->is_bundle) {
            return true;
        }

        foreach ($this->bundleItems as $item) {
            $component = $item->componentProduct;
            if ($component === null) {
                return false;
            }
            if ((float) $component->stock_quantity < (float) $item->quantity) {
                return false;
            }
        }

        return true;
    }

    public function getTotalQuantityAttribute(): float
    {
        return (float) $this->stockLevels()->sum('quantity');
    }

    public function getTotalAvailableAttribute(): float
    {
        return (float) $this->stockLevels()
            ->selectRaw('SUM(quantity - reserved_quantity) as available')
            ->value('available') ?? 0.0;
    }

    public function getTotalStockAttribute(): float
    {
        return (float) $this->stockLevels->sum('quantity');
    }

    public function needsReorder(): bool
    {
        return $this->reorder_point > 0 && $this->total_stock <= $this->reorder_point;
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('sku', 'like', "%{$term}%");
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function costingLayers(): HasMany
    {
        return $this->hasMany(CostingLayer::class);
    }

    public function getAverageCostAttribute(): float
    {
        return CostingLayer::getAverageCost($this->tenant_id, $this->id);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(ProductTag::class, 'product_tag_assignments', 'product_id', 'product_tag_id')
                    ->withTimestamps();
    }

    public function substitutes(): HasMany
    {
        return $this->hasMany(ProductSubstitute::class, 'product_id')->orderBy('priority');
    }

    public function activeSubstitutes(): HasMany
    {
        return $this->hasMany(ProductSubstitute::class, 'product_id')
                    ->where('is_active', true)
                    ->orderBy('priority');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

}

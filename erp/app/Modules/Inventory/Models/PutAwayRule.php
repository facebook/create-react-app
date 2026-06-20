<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PutAwayRule extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'warehouse_id',
        'product_id',
        'product_category_id',
        'location_in_zone_id',
        'location_out_bin_id',
        'location_out_zone_id',
        'sequence',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sequence'  => 'integer',
    ];

    protected $attributes = [
        'sequence'  => 10,
        'is_active' => true,
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    public function locationInZone(): BelongsTo
    {
        return $this->belongsTo(WarehouseZone::class, 'location_in_zone_id');
    }

    public function locationOutBin(): BelongsTo
    {
        return $this->belongsTo(WarehouseBin::class, 'location_out_bin_id');
    }

    public function locationOutZone(): BelongsTo
    {
        return $this->belongsTo(WarehouseZone::class, 'location_out_zone_id');
    }

    public static function findBestRule(int $tenantId, int $productId, int $warehouseId): ?static
    {
        $rules = static::where('tenant_id', $tenantId)
            ->where('warehouse_id', $warehouseId)
            ->where('is_active', true)
            ->orderBy('sequence')
            ->with('product')
            ->get();

        // First pass: product-specific match
        foreach ($rules as $rule) {
            if ($rule->product_id === $productId) {
                return $rule;
            }
        }

        // Second pass: category match
        $product = Product::find($productId);
        if ($product && $product->category_id) {
            foreach ($rules as $rule) {
                if ($rule->product_category_id === $product->category_id) {
                    return $rule;
                }
            }
        }

        return null;
    }

    public function targetLocationLabel(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->locationOutBin) {
                    return $this->locationOutBin->code;
                }
                if ($this->locationOutZone) {
                    return $this->locationOutZone->name;
                }
                return '—';
            },
        );
    }
}

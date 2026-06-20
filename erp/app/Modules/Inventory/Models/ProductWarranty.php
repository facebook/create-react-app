<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class ProductWarranty extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'name',
        'duration_months',
        'warranty_type',
        'terms',
        'is_default',
    ];

    protected $casts = [
        'is_default'      => 'boolean',
        'duration_months' => 'integer',
    ];

    protected $attributes = [
        'warranty_type' => 'standard',
        'is_default'    => false,
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(WarrantyClaim::class);
    }

    public function isExpiredFor(Carbon $purchaseDate): bool
    {
        return Carbon::now()->greaterThan($purchaseDate->copy()->addMonths($this->duration_months));
    }

    public function durationLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->duration_months} months",
        );
    }
}

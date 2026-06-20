<?php

namespace App\Modules\Ecommerce\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StoreCategory extends Model
{
    use BelongsToTenant;

    protected $table = 'store_categories';

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'parent_id',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(StoreCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(StoreCategory::class, 'parent_id');
    }

    public function storeProducts(): HasMany
    {
        return $this->hasMany(StoreProduct::class, 'category_id');
    }
}

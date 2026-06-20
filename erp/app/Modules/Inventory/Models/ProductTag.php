<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductTag extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'name', 'color', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_tag_assignments', 'product_tag_id', 'product_id')
                    ->withTimestamps();
    }

    public function getProductCountAttribute(): int
    {
        return $this->products()->count();
    }
}

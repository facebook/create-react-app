<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductCategory extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'product_categories';

    protected $fillable = [
        'tenant_id', 'name', 'slug', 'description', 'colour',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::deleting(function (self $category) {
            // Nullify category_id on products when a category is soft-deleted
            Product::where('category_id', $category->id)
                ->update(['category_id' => null]);
        });
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}

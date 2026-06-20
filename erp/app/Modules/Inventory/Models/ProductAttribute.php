<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductAttribute extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = ['tenant_id', 'name', 'type', 'options'];

    protected $casts = ['options' => 'array'];

    public function values(): HasMany
    {
        return $this->hasMany(ProductVariantValue::class, 'attribute_id');
    }
}

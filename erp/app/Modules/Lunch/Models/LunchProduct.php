<?php

namespace App\Modules\Lunch\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LunchProduct extends Model
{
    use BelongsToTenant;

    protected $table = 'lunch_products';

    protected $fillable = [
        'tenant_id',
        'lunch_supplier_id',
        'name',
        'description',
        'price',
        'category',
        'is_available',
        'image_url',
    ];

    protected $casts = [
        'price'        => 'decimal:2',
        'is_available' => 'boolean',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(LunchSupplier::class, 'lunch_supplier_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(LunchOrder::class);
    }

    public function subtotal(): float
    {
        return (float) $this->price;
    }
}

<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class PriceList extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'currency', 'is_active', 'is_default',
        'valid_from', 'valid_to', 'notes',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'is_default' => 'boolean',
        'valid_from' => 'date',
        'valid_to'   => 'date',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(PriceListItem::class);
    }

    public function getIsValidAttribute(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $today = Carbon::today();

        if ($this->valid_from !== null && $this->valid_from->gt($today)) {
            return false;
        }

        if ($this->valid_to !== null && $this->valid_to->lt($today)) {
            return false;
        }

        return true;
    }

    public function getItemCountAttribute(): int
    {
        return $this->items()->count();
    }

    public function getPriceForProduct(int $productId, float $quantity = 1): ?float
    {
        $item = $this->items()
            ->where('product_id', $productId)
            ->where('min_quantity', '<=', $quantity)
            ->orderByDesc('min_quantity')
            ->first();

        return $item ? (float) $item->price : null;
    }
}

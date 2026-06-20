<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaxGroup extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'tax_groups';

    protected $fillable = [
        'tenant_id', 'name', 'description', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(TaxGroupItem::class);
    }

    public function calculateTotalTax(float $amount): float
    {
        if (!$this->relationLoaded('items')) {
            $this->load('items.taxRate');
        }

        $sum = 0.0;
        foreach ($this->items as $item) {
            if ($item->taxRate) {
                $sum += $item->taxRate->calculateTax($amount);
            }
        }
        return (float) $sum;
    }

    public function getTotalRateAttribute(): float
    {
        if (!$this->relationLoaded('items')) {
            $this->load('items.taxRate');
        }

        $sum = 0.0;
        foreach ($this->items as $item) {
            if ($item->taxRate) {
                $sum += (float) $item->taxRate->rate;
            }
        }
        return $sum;
    }
}

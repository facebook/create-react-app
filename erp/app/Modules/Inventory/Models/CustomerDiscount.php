<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class CustomerDiscount extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'customer_id', 'discount_type', 'discount_value',
        'applies_to', 'applies_to_id', 'valid_from', 'valid_to', 'is_active',
    ];

    protected $casts = [
        'discount_value' => 'float',
        'is_active'      => 'boolean',
        'valid_from'     => 'date',
        'valid_to'       => 'date',
    ];

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

    public function calculate(float $amount): float
    {
        if ($this->discount_type === 'percentage') {
            return $amount * ($this->discount_value / 100);
        }

        return (float) $this->discount_value;
    }
}

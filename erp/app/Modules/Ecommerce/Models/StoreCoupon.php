<?php

namespace App\Modules\Ecommerce\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class StoreCoupon extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'store_coupons';

    protected $fillable = [
        'tenant_id',
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_uses',
        'uses_count',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'valid_from'  => 'date',
        'valid_until' => 'date',
    ];

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $today = Carbon::today();

        if ($this->valid_from !== null && $this->valid_from->gt($today)) {
            return false;
        }

        if ($this->valid_until !== null && $this->valid_until->lt($today)) {
            return false;
        }

        if ($this->max_uses !== null && $this->uses_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    public function applyTo(float $subtotal): float
    {
        if ($this->type === 'percentage') {
            return round($subtotal * $this->value / 100, 2);
        }

        return min((float) $this->value, $subtotal);
    }

    public function redeem(): void
    {
        $this->increment('uses_count');
    }
}

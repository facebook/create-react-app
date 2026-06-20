<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class PaymentTerm extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'days', 'discount_days', 'discount_percent',
        'description', 'is_active',
    ];

    protected $casts = [
        'days'             => 'integer',
        'discount_days'    => 'integer',
        'discount_percent' => 'float',
        'is_active'        => 'boolean',
    ];

    public function getDueDate(Carbon $fromDate): Carbon
    {
        return $fromDate->copy()->addDays($this->days);
    }

    public function getDiscountDueDate(Carbon $fromDate): Carbon
    {
        return $fromDate->copy()->addDays($this->discount_days);
    }

    public function getHasEarlyDiscountAttribute(): bool
    {
        return $this->discount_days > 0 && $this->discount_percent > 0;
    }

    public function getDisplayLabelAttribute(): string
    {
        if ($this->has_early_discount) {
            return "{$this->discount_percent}/{$this->discount_days} Net {$this->days}";
        }
        return "Net {$this->days}";
    }
}

<?php

namespace App\Modules\Subscriptions\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionPlan extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'billing_cycle',
        'price',
        'trial_days',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price'     => 'decimal:2',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    public function monthlyEquivalent(): float
    {
        $months = match ($this->billing_cycle) {
            'monthly'   => 1,
            'quarterly' => 3,
            'annual'    => 12,
            default     => 1,
        };

        return (float) ($this->price / $months);
    }

    public function cycleDays(): int
    {
        return match ($this->billing_cycle) {
            'monthly'   => 30,
            'quarterly' => 90,
            'annual'    => 365,
            default     => 30,
        };
    }
}

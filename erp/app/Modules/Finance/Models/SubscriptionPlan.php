<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionPlan extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'description', 'billing_cycle',
        'price', 'trial_days', 'is_active',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function getNextBillingDate(string $from): string
    {
        return match ($this->billing_cycle) {
            'monthly'   => Carbon::parse($from)->addMonth()->toDateString(),
            'quarterly' => Carbon::parse($from)->addMonths(3)->toDateString(),
            'annual'    => Carbon::parse($from)->addYear()->toDateString(),
            'annually'  => Carbon::parse($from)->addYear()->toDateString(),
            default     => Carbon::parse($from)->addMonth()->toDateString(),
        };
    }
}

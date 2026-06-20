<?php

namespace App\Modules\Subscriptions\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'plan_id',
        'customer_name',
        'customer_email',
        'status',
        'trial_ends_at',
        'current_period_start',
        'current_period_end',
        'cancelled_at',
        'notes',
    ];

    protected $casts = [
        'trial_ends_at'        => 'datetime',
        'cancelled_at'         => 'datetime',
        'current_period_start' => 'date',
        'current_period_end'   => 'date',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(SubscriptionInvoice::class, 'subscription_id');
    }

    public function cancel(): void
    {
        $this->status       = 'cancelled';
        $this->cancelled_at = now();
        $this->save();
    }

    public function renew(): SubscriptionInvoice
    {
        $plan     = $this->plan;
        $cycleDays = $plan->cycleDays();

        $newStart = $this->current_period_end->copy()->addDay();
        $newEnd   = $newStart->copy()->addDays($cycleDays - 1);

        $invoice = $this->invoices()->create([
            'tenant_id'    => $this->tenant_id,
            'amount'       => $plan->price,
            'status'       => 'pending',
            'due_date'     => $newStart,
            'period_start' => $newStart,
            'period_end'   => $newEnd,
        ]);

        $this->status               = 'active';
        $this->current_period_start = $newStart;
        $this->current_period_end   = $newEnd;
        $this->save();

        event(new \App\Events\Subscriptions\SubscriptionRenewed($this));

        return $invoice;
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['trial', 'active']);
    }

    public function daysUntilRenewal(): int
    {
        return (int) Carbon::today()->diffInDays($this->current_period_end, false);
    }

    public function mrr(): float
    {
        if (! $this->isActive()) {
            return 0.0;
        }

        return $this->plan->monthlyEquivalent();
    }
}

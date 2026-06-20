<?php

namespace App\Modules\Subscriptions\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionInvoice extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'subscription_id',
        'amount',
        'status',
        'due_date',
        'paid_at',
        'period_start',
        'period_end',
    ];

    protected $casts = [
        'due_date'     => 'date',
        'period_start' => 'date',
        'period_end'   => 'date',
        'paid_at'      => 'datetime',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_id');
    }

    public function markPaid(): void
    {
        $this->status  = 'paid';
        $this->paid_at = now();
        $this->save();
    }

    public function markFailed(): void
    {
        $this->status = 'failed';
        $this->save();

        $this->subscription()->update(['status' => 'past_due']);
    }
}

<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdvancePayment extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'contact_id', 'reference', 'amount', 'applied_amount',
        'currency', 'payment_date', 'status', 'payment_method', 'notes',
        'created_by', 'refunded_at',
    ];

    protected $casts = [
        'amount'         => 'float',
        'applied_amount' => 'float',
        'payment_date'   => 'date',
        'refunded_at'    => 'datetime',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applyAmount(float $amount): void
    {
        $this->applied_amount = min($this->applied_amount + $amount, $this->amount);
        $this->status = $this->applied_amount >= $this->amount ? 'fully_applied' : 'partially_applied';
        $this->save();
    }

    public function refund(): void
    {
        $this->status      = 'refunded';
        $this->refunded_at = now();
        $this->save();
    }

    public function getRemainingAmountAttribute(): float
    {
        return max(0.0, $this->amount - $this->applied_amount);
    }

    public function getIsAvailableAttribute(): bool
    {
        return $this->status !== 'refunded' && $this->remaining_amount > 0;
    }
}

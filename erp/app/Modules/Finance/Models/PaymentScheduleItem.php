<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class PaymentScheduleItem extends Model
{
    protected $fillable = [
        'payment_schedule_id',
        'installment_number',
        'amount',
        'due_date',
        'paid_date',
        'status',
    ];

    protected $casts = [
        'amount'    => 'decimal:2',
        'due_date'  => 'date',
        'paid_date' => 'date',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(PaymentSchedule::class);
    }

    // ─── Actions ──────────────────────────────────────────────────────────────

    public function markPaid(string $date = null): void
    {
        $this->status    = 'paid';
        $this->paid_date = $date ?? Carbon::today()->toDateString();
        $this->save();
    }

    public function waive(): void
    {
        $this->status = 'waived';
        $this->save();
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'pending' && $this->due_date->lt(Carbon::today());
    }
}

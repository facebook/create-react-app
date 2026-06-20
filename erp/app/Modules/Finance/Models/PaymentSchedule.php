<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentSchedule extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'schedule_number',
        'name',
        'reference_type',
        'reference_id',
        'total_amount',
        'paid_amount',
        'currency',
        'frequency',
        'installments',
        'start_date',
        'end_date',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'total_amount'  => 'decimal:2',
        'paid_amount'   => 'decimal:2',
        'start_date'    => 'date',
        'end_date'      => 'date',
        'installments'  => 'integer',
    ];

    protected $attributes = [
        'status'       => 'active',
        'currency'     => 'USD',
        'frequency'    => 'monthly',
        'paid_amount'  => 0,
        'installments' => 1,
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function items(): HasMany
    {
        return $this->hasMany(PaymentScheduleItem::class);
    }

    // ─── Actions ──────────────────────────────────────────────────────────────

    public function pause(): void
    {
        $this->status = 'paused';
        $this->save();
    }

    public function resume(): void
    {
        $this->status = 'active';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function generateScheduleNumber(): string
    {
        return 'PS-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function recalculatePaidAmount(): void
    {
        $this->paid_amount = $this->items()->where('status', 'paid')->sum('amount');

        if ((float) $this->paid_amount >= (float) $this->total_amount) {
            $this->status = 'completed';
        }

        $this->save();
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getRemainingAmountAttribute(): float
    {
        return (float) $this->total_amount - (float) $this->paid_amount;
    }

    public function getCompletionPercentAttribute(): float
    {
        if ((float) $this->total_amount > 0) {
            return round(((float) $this->paid_amount / (float) $this->total_amount) * 100, 2);
        }

        return 0;
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }
}

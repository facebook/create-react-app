<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RecurringExpense extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'expense_number',
        'category',
        'amount',
        'currency',
        'frequency',
        'start_date',
        'end_date',
        'next_due_date',
        'last_processed_date',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount'               => 'decimal:2',
        'start_date'           => 'date',
        'end_date'             => 'date',
        'next_due_date'        => 'date',
        'last_processed_date'  => 'date',
    ];

    protected $attributes = [
        'status'    => 'active',
        'currency'  => 'USD',
        'frequency' => 'monthly',
    ];

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

    public function generateExpenseNumber(): string
    {
        return 'RE-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function calculateNextDueDate(): void
    {
        $base = $this->last_processed_date
            ? Carbon::parse($this->last_processed_date)
            : Carbon::parse($this->start_date);

        $next = match ($this->frequency) {
            'monthly'   => $base->copy()->addMonth(),
            'quarterly' => $base->copy()->addMonths(3),
            'annual'    => $base->copy()->addYear(),
            'weekly'    => $base->copy()->addWeek(),
            default     => $base->copy()->addMonth(),
        };

        $this->next_due_date = $next;
        $this->save();
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getIsDueAttribute(): bool
    {
        return $this->is_active
            && $this->next_due_date !== null
            && $this->next_due_date->lte(Carbon::today());
    }
}

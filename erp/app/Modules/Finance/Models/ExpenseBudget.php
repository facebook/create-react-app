<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseBudget extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'budget_code',
        'department',
        'category',
        'period',
        'allocated_amount',
        'spent_amount',
        'currency',
        'status',
        'notes',
        'owner_id',
        'created_by',
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
        'spent_amount'     => 'decimal:2',
    ];

    protected $attributes = [
        'status'           => 'active',
        'currency'         => 'USD',
        'allocated_amount' => 0,
        'spent_amount'     => 0,
    ];

    // ─── Actions ──────────────────────────────────────────────────────────────

    public function freeze(): void
    {
        $this->status = 'frozen';
        $this->save();
    }

    public function close(): void
    {
        $this->status = 'closed';
        $this->save();
    }

    public function recordSpend(float $amount): void
    {
        $this->spent_amount = (float) $this->spent_amount + $amount;
        $this->save();
    }

    public function generateBudgetCode(): string
    {
        return 'EB-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getRemainingAmountAttribute(): float
    {
        return max(0, (float) $this->allocated_amount - (float) $this->spent_amount);
    }

    public function getUtilizationPercentAttribute(): float
    {
        $allocated = (float) $this->allocated_amount;

        if ($allocated <= 0) {
            return 0.0;
        }

        return round(((float) $this->spent_amount / $allocated) * 100, 2);
    }

    public function getIsOverBudgetAttribute(): bool
    {
        return (float) $this->spent_amount > (float) $this->allocated_amount;
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }
}

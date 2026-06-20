<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Budget extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'budget_number', 'fiscal_year', 'year', 'period_type',
        'department', 'budget_type', 'total_amount', 'allocated_amount', 'spent_amount',
        'status', 'notes', 'approved_by', 'approved_at', 'start_date', 'end_date',
        'created_by',
    ];

    protected $casts = [
        'fiscal_year'      => 'integer',
        'year'             => 'integer',
        'total_amount'     => 'decimal:2',
        'allocated_amount' => 'decimal:2',
        'spent_amount'     => 'decimal:2',
        'approved_at'      => 'datetime',
        'start_date'       => 'date',
        'end_date'         => 'date',
    ];

    protected $attributes = [
        'status'           => 'draft',
        'total_amount'     => 0,
        'allocated_amount' => 0,
        'spent_amount'     => 0,
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function lines(): HasMany
    {
        return $this->hasMany(BudgetLine::class);
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(BudgetLineItem::class);
    }

    // ─── Actions ──────────────────────────────────────────────────────────────

    public function activate(int $userId): void
    {
        $this->status      = 'active';
        $this->approved_by = $userId;
        $this->approved_at = now();

        if (is_null($this->budget_number)) {
            $this->budget_number = $this->generateBudgetNumber();
        }

        $this->save();
    }

    public function close(): void
    {
        $this->status = 'closed';
        $this->save();
    }

    public function generateBudgetNumber(): string
    {
        return 'BDG-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function recalculate(): void
    {
        $spent = (float) $this->lineItems()->sum('actual_amount');

        $this->spent_amount = $spent;

        if ($spent >= (float) $this->total_amount) {
            $this->status = 'exceeded';
        }

        $this->save();
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getRemainingAmountAttribute(): float
    {
        return (float) $this->total_amount - (float) $this->spent_amount;
    }

    public function getUtilizationPercentAttribute(): float
    {
        $total = (float) $this->total_amount;

        if ($total <= 0) {
            return 0.0;
        }

        return round(((float) $this->spent_amount / $total) * 100, 2);
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getIsExceededAttribute(): bool
    {
        return $this->status === 'exceeded';
    }

    // ─── Legacy accessors (Phase 82) ──────────────────────────────────────────

    public function getTotalBudgetedAttribute(): float
    {
        return (float) $this->lines->sum('budgeted_amount');
    }

    public function getTotalActualAttribute(): float
    {
        return (float) $this->lines->sum('actual_amount');
    }

    public function getTotalVarianceAttribute(): float
    {
        return $this->total_actual - $this->total_budgeted;
    }

    public function getVariancePercentAttribute(): float
    {
        $budgeted = $this->total_budgeted;

        if ($budgeted == 0) {
            return 0.0;
        }

        return round(($this->total_variance / abs($budgeted)) * 100, 1);
    }
}

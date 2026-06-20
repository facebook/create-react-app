<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetLine extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'budget_id', 'category', 'line_type', 'period_number',
        'budgeted_amount', 'actual_amount', 'notes',
    ];

    protected $casts = [
        'budgeted_amount' => 'float',
        'actual_amount'   => 'float',
        'period_number'   => 'integer',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function getVarianceAttribute(): float
    {
        return $this->actual_amount - $this->budgeted_amount;
    }

    public function getVariancePercentAttribute(): float
    {
        if ($this->budgeted_amount == 0) {
            return 0.0;
        }
        return round(($this->variance / abs($this->budgeted_amount)) * 100, 1);
    }

    public function getIsOverBudgetAttribute(): bool
    {
        if ($this->line_type === 'income') {
            // For income, negative variance = under-performing = over budget
            return $this->variance < 0;
        }
        // For expenses, positive variance = over budget
        return $this->variance > 0;
    }
}

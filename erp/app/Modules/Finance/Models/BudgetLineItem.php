<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetLineItem extends Model
{
    protected $fillable = [
        'budget_id', 'category', 'description', 'planned_amount', 'actual_amount',
    ];

    protected $casts = [
        'planned_amount' => 'decimal:2',
        'actual_amount'  => 'decimal:2',
    ];

    protected $attributes = [
        'planned_amount' => 0,
        'actual_amount'  => 0,
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function getVarianceAttribute(): float
    {
        return (float) $this->planned_amount - (float) $this->actual_amount;
    }
}

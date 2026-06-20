<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeBenefit extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'benefit_plan_id',
        'enrolled_at',
        'ended_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'enrolled_at' => 'date',
        'ended_at'    => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(BenefitPlan::class, 'benefit_plan_id');
    }

    public function waive(): void
    {
        $this->status = 'waived';
        $this->save();
    }

    public function end(): void
    {
        $this->status    = 'ended';
        $this->ended_at  = now()->toDateString();
        $this->save();
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getMonthlyCostAttribute(): float
    {
        return $this->plan?->employee_cost ?? 0.0;
    }
}

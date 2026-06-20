<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveBalance extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'employee_id', 'leave_type_id',
        'year', 'allocated_days', 'used_days', 'pending_days',
    ];

    protected $casts = [
        'allocated_days' => 'float',
        'used_days'      => 'float',
        'pending_days'   => 'float',
        'year'           => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class, 'leave_type_id');
    }

    public function getRemainingDaysAttribute(): float
    {
        return (float) $this->allocated_days - (float) $this->used_days - (float) $this->pending_days;
    }
}

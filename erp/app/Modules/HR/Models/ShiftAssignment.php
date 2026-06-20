<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftAssignment extends Model
{
    use BelongsToTenant;

    protected $table = 'shift_assignments';

    protected $fillable = [
        'tenant_id',
        'shift_template_id',
        'employee_id',
        'assigned_date',
        'notes',
        'status',
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'status'        => 'string',
    ];

    public function shiftTemplate(): BelongsTo
    {
        return $this->belongsTo(ShiftTemplate::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function getIsUpcomingAttribute(): bool
    {
        return $this->assigned_date->greaterThanOrEqualTo(Carbon::today());
    }
}

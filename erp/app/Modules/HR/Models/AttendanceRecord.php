<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttendanceRecord extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'work_date',
        'clock_in',
        'clock_out',
        'break_minutes',
        'status',
        'notes',
    ];

    protected $casts = [
        'work_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function getWorkedHoursAttribute(): ?float
    {
        if (empty($this->clock_in) || empty($this->clock_out)) {
            return null;
        }

        $clockIn  = Carbon::createFromFormat('H:i:s', $this->clock_in);
        $clockOut = Carbon::createFromFormat('H:i:s', $this->clock_out);

        $minutes = $clockIn->diffInMinutes($clockOut) - ($this->break_minutes ?? 0);

        return round($minutes / 60, 2);
    }

    public function getIsLateAttribute(): bool
    {
        return false;
    }
}

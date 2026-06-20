<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkScheduleShift extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'work_schedule_id',
        'day_of_week',
        'start_time',
        'end_time',
        'break_minutes',
    ];

    protected $casts = [
        'break_minutes' => 'float',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(WorkSchedule::class, 'work_schedule_id');
    }

    public function getHoursAttribute(): float
    {
        $start = Carbon::createFromFormat('H:i', substr($this->start_time, 0, 5));
        $end   = Carbon::createFromFormat('H:i', substr($this->end_time, 0, 5));

        $totalMinutes = $start->diffInMinutes($end);
        $workMinutes  = $totalMinutes - (float) $this->break_minutes;

        return round($workMinutes / 60, 2);
    }
}

<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShiftTemplate extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'shift_templates';

    protected $fillable = [
        'tenant_id',
        'name',
        'start_time',
        'end_time',
        'break_minutes',
        'days_of_week',
        'color',
        'is_active',
    ];

    protected $casts = [
        'days_of_week'   => 'array',
        'break_minutes'  => 'integer',
        'is_active'      => 'boolean',
    ];

    public function assignments(): HasMany
    {
        return $this->hasMany(ShiftAssignment::class);
    }

    public function getDurationHoursAttribute(): float
    {
        $start = Carbon::createFromFormat('H:i', substr($this->start_time, 0, 5));
        $end   = Carbon::createFromFormat('H:i', substr($this->end_time, 0, 5));

        $totalMinutes = $start->diffInMinutes($end);
        $workMinutes  = $totalMinutes - (int) $this->break_minutes;

        return round($workMinutes / 60, 2);
    }
}

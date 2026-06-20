<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkSchedule extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'timezone',
        'hours_per_week',
        'is_active',
        'description',
        // Legacy fields kept for backward compatibility
        'monday_start',
        'monday_end',
        'tuesday_start',
        'tuesday_end',
        'wednesday_start',
        'wednesday_end',
        'thursday_start',
        'thursday_end',
        'friday_start',
        'friday_end',
        'saturday_start',
        'saturday_end',
        'sunday_start',
        'sunday_end',
        'is_default',
    ];

    protected $casts = [
        'hours_per_week' => 'integer',
        'is_active'      => 'boolean',
        'is_default'     => 'boolean',
    ];

    public function shifts(): HasMany
    {
        return $this->hasMany(WorkScheduleShift::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(EmployeeSchedule::class);
    }

    public function getShiftCountAttribute(): int
    {
        return $this->shifts()->count();
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function getDayHours(string $day): ?array
    {
        $start = $this->{"{$day}_start"};
        $end   = $this->{"{$day}_end"};

        if (empty($start)) {
            return null;
        }

        return ['start' => $start, 'end' => $end];
    }
}

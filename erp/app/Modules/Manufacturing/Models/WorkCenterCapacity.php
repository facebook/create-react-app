<?php

namespace App\Modules\Manufacturing\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkCenterCapacity extends Model
{
    use BelongsToTenant;

    protected $table = 'work_center_capacities';

    protected $fillable = [
        'tenant_id',
        'work_center_id',
        'day_of_week',
        'start_time',
        'end_time',
        'capacity_hours',
    ];

    public function workCenter(): BelongsTo
    {
        return $this->belongsTo(WorkCenter::class);
    }

    public function availableHours(): float
    {
        // Parse start and end times to calculate difference in hours
        [$sh, $sm] = array_map('intval', explode(':', $this->start_time));
        [$eh, $em] = array_map('intval', explode(':', $this->end_time));

        $startMinutes = $sh * 60 + $sm;
        $endMinutes   = $eh * 60 + $em;

        return (float) (($endMinutes - $startMinutes) / 60);
    }
}

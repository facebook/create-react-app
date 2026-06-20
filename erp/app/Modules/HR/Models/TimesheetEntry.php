<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimesheetEntry extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'timesheet_id', 'work_date', 'hours', 'project', 'description',
    ];

    protected $casts = [
        'work_date' => 'date',
        'hours'     => 'float',
    ];

    public function timesheet(): BelongsTo
    {
        return $this->belongsTo(Timesheet::class);
    }
}

<?php

namespace App\Modules\PM\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntry extends Model
{
    use BelongsToTenant;

    protected $table = 'time_entries';

    protected $fillable = [
        'tenant_id', 'task_id', 'user_id', 'description',
        'hours', 'date', 'is_billable', 'created_by',
    ];

    protected $casts = [
        'date'        => 'date',
        'hours'       => 'float',
        'is_billable' => 'boolean',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

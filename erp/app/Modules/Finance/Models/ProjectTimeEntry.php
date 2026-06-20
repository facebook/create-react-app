<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTimeEntry extends Model
{
    use BelongsToTenant;

    protected $table = 'finance_project_time_entries';

    protected $fillable = [
        'tenant_id',
        'project_id',
        'task_id',
        'user_id',
        'description',
        'hours',
        'entry_date',
        'is_billable',
    ];

    protected $casts = [
        'hours'      => 'decimal:2',
        'entry_date' => 'date',
        'is_billable' => 'boolean',
    ];

    // Relations

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(ProjectTask::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

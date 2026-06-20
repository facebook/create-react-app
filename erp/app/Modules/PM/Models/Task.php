<?php

namespace App\Modules\PM\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'tasks';

    protected $fillable = [
        'tenant_id', 'project_id', 'sprint_id', 'title', 'description',
        'status', 'priority', 'assignee_id', 'start_date', 'due_date',
        'estimated_hours', 'actual_hours', 'story_points', 'sequence',
        'created_by', 'parent_task_id',
    ];

    protected $casts = [
        'start_date'      => 'date',
        'due_date'        => 'date',
        'estimated_hours' => 'float',
        'actual_hours'    => 'float',
        'story_points'    => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(ProjectSprint::class, 'sprint_id');
    }

    public function dependencies(): HasMany
    {
        return $this->hasMany(TaskDependency::class, 'task_id');
    }

    public function blockedBy(): HasMany
    {
        return $this->hasMany(TaskDependency::class, 'depends_on_id');
    }

    public function addDependency(Task $depends_on, string $type = 'finish_to_start'): TaskDependency
    {
        return TaskDependency::create([
            'tenant_id'       => $this->tenant_id,
            'task_id'         => $this->id,
            'depends_on_id'   => $depends_on->id,
            'dependency_type' => $type,
        ]);
    }

    public function complete(): void
    {
        $this->status = 'done';
        $this->save();
    }

    public function isOverdue(): bool
    {
        if (is_null($this->due_date)) {
            return false;
        }
        return $this->due_date->lt(now()->startOfDay())
            && !in_array($this->status, ['done', 'cancelled']);
    }
}

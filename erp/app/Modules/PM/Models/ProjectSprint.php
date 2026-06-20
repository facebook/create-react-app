<?php

namespace App\Modules\PM\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectSprint extends Model
{
    use BelongsToTenant;

    protected $table = 'project_sprints';

    protected $fillable = [
        'tenant_id',
        'project_id',
        'name',
        'goal',
        'status',
        'start_date',
        'end_date',
        'velocity',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'velocity'   => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'sprint_id');
    }

    public function activate(): void
    {
        $this->status = 'active';
        $this->save();
    }

    public function complete(): void
    {
        $this->status   = 'completed';
        $this->velocity = (int) $this->tasks()->where('status', 'done')->sum('story_points');
        $this->save();
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function taskCount(): int
    {
        return $this->tasks()->count();
    }

    public function completedTaskCount(): int
    {
        return $this->tasks()->where('status', 'done')->count();
    }
}

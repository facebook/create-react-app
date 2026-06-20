<?php

namespace App\Modules\PM\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'projects';

    protected $fillable = [
        'tenant_id', 'name', 'code', 'description',
        'status', 'priority', 'budget', 'spent_budget',
        'start_date', 'end_date', 'client_name',
        'manager_id', 'created_by',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'budget'       => 'float',
        'spent_budget' => 'float',
    ];

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class);
    }

    public function sprints(): HasMany
    {
        return $this->hasMany(ProjectSprint::class);
    }

    public function activeSprint(): ?ProjectSprint
    {
        return $this->sprints()->where('status', 'active')->first();
    }

    public function timeEntries(): HasManyThrough
    {
        return $this->hasManyThrough(TimeEntry::class, Task::class);
    }

    public function generateCode(): string
    {
        return 'PM-' . date('Y') . '-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    public function totalHours(): float
    {
        return (float) $this->timeEntries()->sum('hours');
    }

    public function progressPercentage(): float
    {
        $total = $this->tasks()->count();
        if ($total === 0) {
            return 0.0;
        }
        $done = $this->tasks()->where('status', 'done')->count();
        return round(($done / $total) * 100, 2);
    }
}

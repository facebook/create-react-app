<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'finance_projects';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'contact_id',
        'status',
        'start_date',
        'end_date',
        'budget',
        'billing_type',
        'hourly_rate',
    ];

    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
        'budget'      => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'status'      => 'string',
        'billing_type' => 'string',
    ];

    // Relations

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class);
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(ProjectTimeEntry::class);
    }

    // Actions

    public function activate(): void
    {
        $this->status = 'active';
        $this->save();
    }

    public function complete(): void
    {
        $this->status = 'completed';
        $this->save();
    }

    // Accessors

    public function getTotalHoursAttribute(): float
    {
        if ($this->relationLoaded('timeEntries')) {
            return (float) $this->timeEntries->sum('hours');
        }
        return (float) $this->timeEntries()->sum('hours');
    }

    public function getTotalBilledAttribute(): float
    {
        if ($this->billing_type === 'hourly') {
            return $this->total_hours * (float) ($this->hourly_rate ?? 0);
        }
        if ($this->billing_type === 'fixed') {
            return (float) ($this->budget ?? 0);
        }
        return 0.0;
    }

    public function getCompletionPercentAttribute(): float
    {
        if ($this->relationLoaded('tasks')) {
            $total = $this->tasks->count();
        } else {
            $total = $this->tasks()->count();
        }

        if ($total === 0) {
            return 0.0;
        }

        if ($this->relationLoaded('tasks')) {
            $completed = $this->tasks->where('status', 'done')->count();
        } else {
            $completed = $this->tasks()->where('status', 'done')->count();
        }

        return round(($completed / $total) * 100, 1);
    }
}

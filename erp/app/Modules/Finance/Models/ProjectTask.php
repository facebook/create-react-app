<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTask extends Model
{
    use BelongsToTenant;

    protected $table = 'finance_project_tasks';

    protected $fillable = [
        'tenant_id',
        'project_id',
        'title',
        'description',
        'assigned_to',
        'status',
        'priority',
        'due_date',
        'estimated_hours',
        'actual_hours',
    ];

    protected $casts = [
        'due_date'        => 'date',
        'estimated_hours' => 'decimal:2',
        'actual_hours'    => 'decimal:2',
    ];

    // Relations

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Actions

    public function complete(): void
    {
        $this->status = 'done';
        $this->save();
    }

    // Accessors

    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date !== null
            && $this->due_date->lt(now()->startOfDay())
            && $this->status !== 'done';
    }
}

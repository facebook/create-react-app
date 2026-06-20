<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeGoal extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'title',
        'description',
        'goal_type',
        'category',
        'target_value',
        'current_value',
        'unit',
        'start_date',
        'due_date',
        'completed_at',
        'status',
        'progress_percent',
        'priority',
        'created_by',
    ];

    protected $attributes = [
        'status'           => 'active',
        'goal_type'        => 'individual',
        'priority'         => 'medium',
        'progress_percent' => 0,
        'current_value'    => 0,
    ];

    protected $casts = [
        'target_value'     => 'decimal:2',
        'current_value'    => 'decimal:2',
        'start_date'       => 'date',
        'due_date'         => 'date',
        'completed_at'     => 'date',
        'progress_percent' => 'integer',
    ];

    // Relations

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    // Methods

    public function complete(): void
    {
        $this->status           = 'completed';
        $this->completed_at     = now()->toDateString();
        $this->progress_percent = 100;
        $this->save();
    }

    public function miss(): void
    {
        $this->status = 'missed';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function updateProgress(int $percent): void
    {
        $this->progress_percent = min(100, max(0, $percent));
        if ($this->progress_percent >= 100) {
            $this->complete();
        } else {
            $this->save();
        }
    }

    // Accessors

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->is_active && $this->due_date < Carbon::today();
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }
}

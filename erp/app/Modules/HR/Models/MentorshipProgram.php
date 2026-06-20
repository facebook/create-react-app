<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MentorshipProgram extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'mentor_id',
        'mentee_id',
        'program_number',
        'title',
        'objectives',
        'start_date',
        'end_date',
        'status',
        'meeting_frequency',
        'sessions_completed',
        'sessions_planned',
        'notes',
        'created_by',
    ];

    protected $attributes = [
        'status'             => 'active',
        'meeting_frequency'  => 'monthly',
        'sessions_completed' => 0,
        'sessions_planned'   => 0,
    ];

    protected $casts = [
        'start_date'         => 'date',
        'end_date'           => 'date',
        'sessions_completed' => 'integer',
        'sessions_planned'   => 'integer',
    ];

    // Relations

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'mentor_id');
    }

    public function mentee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'mentee_id');
    }

    // Status methods

    public function complete(): void
    {
        $this->status = 'completed';
        $this->save();
    }

    public function pause(): void
    {
        $this->status = 'paused';
        $this->save();
    }

    public function resume(): void
    {
        $this->status = 'active';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function logSession(): void
    {
        $this->sessions_completed++;
        $this->save();
    }

    public function generateProgramNumber(): string
    {
        return 'MP-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    // Accessors

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getProgressPercentAttribute(): int
    {
        if ($this->sessions_planned > 0) {
            return (int) min(100, round(($this->sessions_completed / $this->sessions_planned) * 100));
        }

        return 0;
    }
}

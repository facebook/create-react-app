<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class InterviewSchedule extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'interview_number',
        'candidate_name',
        'candidate_email',
        'position_title',
        'interview_type',
        'status',
        'scheduled_at',
        'duration_minutes',
        'location',
        'meeting_link',
        'notes',
        'feedback',
        'outcome',
        'interviewer_id',
        'job_application_id',
        'created_by',
    ];

    protected $casts = [
        'scheduled_at'     => 'datetime',
        'duration_minutes' => 'integer',
    ];

    protected $attributes = [
        'status'           => 'scheduled',
        'interview_type'   => 'in-person',
        'duration_minutes' => 60,
    ];

    // Relations

    public function interviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }

    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // State transition methods

    public function confirm(): void
    {
        $this->status = 'confirmed';
        $this->save();
    }

    public function complete(string $outcome = null, string $feedback = null): void
    {
        $this->status = 'completed';
        if ($outcome !== null) {
            $this->outcome = $outcome;
        }
        if ($feedback !== null) {
            $this->feedback = $feedback;
        }
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function markNoShow(): void
    {
        $this->status = 'no-show';
        $this->save();
    }

    public function generateInterviewNumber(): string
    {
        return 'INT-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    // Accessors

    public function getIsScheduledAttribute(): bool
    {
        return $this->status === 'scheduled';
    }

    public function getIsConfirmedAttribute(): bool
    {
        return $this->status === 'confirmed';
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }
}

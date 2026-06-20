<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSession extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'training_course_id', 'title', 'session_number',
        'description', 'location', 'delivery_mode', 'status',
        'scheduled_at', 'ends_at', 'max_participants', 'enrolled_count',
        'facilitator_id', 'created_by',
    ];

    protected $casts = [
        'scheduled_at'    => 'datetime',
        'ends_at'         => 'datetime',
        'max_participants'=> 'integer',
        'enrolled_count'  => 'integer',
    ];

    protected $attributes = [
        'status'           => 'scheduled',
        'delivery_mode'    => 'in-person',
        'max_participants' => 20,
        'enrolled_count'   => 0,
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(TrainingCourse::class, 'training_course_id');
    }

    public function facilitator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'facilitator_id');
    }

    public function start(): void
    {
        $this->status = 'in-progress';
        $this->save();
    }

    public function complete(): void
    {
        $this->status = 'completed';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function generateSessionNumber(): string
    {
        return 'TS-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function getIsScheduledAttribute(): bool
    {
        return $this->status === 'scheduled';
    }

    public function getIsFullAttribute(): bool
    {
        return $this->enrolled_count >= $this->max_participants;
    }

    public function getSpotsRemainingAttribute(): int
    {
        return max(0, $this->max_participants - $this->enrolled_count);
    }

    public function getDurationMinutesAttribute(): ?int
    {
        if ($this->scheduled_at && $this->ends_at) {
            return (int) $this->scheduled_at->diffInMinutes($this->ends_at);
        }
        return null;
    }
}

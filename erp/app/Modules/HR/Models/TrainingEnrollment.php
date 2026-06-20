<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingEnrollment extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'employee_id', 'training_course_id',
        'enrolled_date', 'scheduled_date', 'completed_date',
        'status', 'score', 'notes', 'enrolled_by',
    ];

    protected $casts = [
        'enrolled_date'   => 'date',
        'scheduled_date'  => 'date',
        'completed_date'  => 'date',
        'score'           => 'float',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(TrainingCourse::class, 'training_course_id');
    }

    public function enrolledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enrolled_by');
    }

    public function complete(float $score = null, string $notes = null): void
    {
        $this->status         = 'completed';
        $this->completed_date = now()->toDateString();
        $this->score          = $score;
        $this->notes          = $notes;
        $this->save();
    }

    public function fail(string $notes = null): void
    {
        $this->status         = 'failed';
        $this->completed_date = now()->toDateString();
        $this->notes          = $notes;
        $this->save();
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getIsExpiredAttribute(): bool
    {
        return false;
    }
}

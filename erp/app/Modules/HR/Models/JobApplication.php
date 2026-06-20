<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'job_position_id',
        'applicant_name',
        'applicant_email',
        'applicant_phone',
        'status',
        'stage',
        'cover_letter',
        'resume_url',
        'resume_path',
        'source',
        'rating',
        'notes',
        'reviewed_by',
        'reviewed_at',
        'rejected_at',
        'hired_at',
    ];

    protected $casts = [
        'rating'      => 'integer',
        'reviewed_at' => 'datetime',
        'rejected_at' => 'datetime',
        'hired_at'    => 'datetime',
    ];

    public function position(): BelongsTo
    {
        return $this->belongsTo(JobPosition::class, 'job_position_id');
    }

    public function jobPosition(): BelongsTo
    {
        return $this->belongsTo(JobPosition::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function advance(string $newStatus): void
    {
        $this->status = $newStatus;
        $this->stage  = $newStatus;
        if ($newStatus === 'hired') {
            $this->hired_at = now();
        }
        if ($newStatus === 'rejected') {
            $this->rejected_at = now();
        }
        $this->save();
    }

    public function hire(): void
    {
        $this->status    = 'hired';
        $this->stage     = 'hired';
        $this->hired_at  = now();
        $this->save();
    }

    public function reject(string $notes = ''): void
    {
        $this->status      = 'rejected';
        $this->stage       = 'rejected';
        $this->rejected_at = now();
        if ($notes !== '') {
            $this->notes = $notes;
        }
        $this->save();
    }

    public function getIsActiveAttribute(): bool
    {
        $terminal = ['hired', 'rejected'];
        $s = $this->status ?? $this->stage ?? 'new';
        return !in_array($s, $terminal);
    }
}

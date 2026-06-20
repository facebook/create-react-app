<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Timesheet extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'employee_id', 'week_start', 'week_end', 'status',
        'total_hours', 'approved_by', 'approved_at', 'notes',
    ];

    protected $casts = [
        'week_start'  => 'date',
        'week_end'    => 'date',
        'total_hours' => 'float',
        'approved_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(TimesheetEntry::class);
    }

    public function submit(): void
    {
        $this->status = 'submitted';
        $this->save();
    }

    public function approve(int $userId): void
    {
        $this->status      = 'approved';
        $this->approved_by = $userId;
        $this->approved_at = now();
        $this->save();
    }

    public function reject(): void
    {
        $this->status = 'rejected';
        $this->save();
    }

    public function recalculateHours(): void
    {
        $this->total_hours = $this->entries()->sum('hours');
        $this->save();
    }

    public function getIsEditableAttribute(): bool
    {
        return $this->status === 'draft';
    }

    public function getIsApprovedAttribute(): bool
    {
        return $this->status === 'approved';
    }
}

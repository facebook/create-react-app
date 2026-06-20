<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'employee_id', 'leave_type_id',
        'start_date', 'end_date',
        'days',           // legacy column
        'days_requested', // new column (phase 83)
        'status',
        'notes',          // legacy column
        'reason',         // new column (phase 83)
        'rejection_reason',
        'reviewed_by',    // legacy column
        'reviewed_at',    // legacy column
        'approved_by',    // new column alias (phase 83)
        'approved_at',    // new column alias (phase 83)
    ];

    protected $casts = [
        'start_date'      => 'date',
        'end_date'        => 'date',
        'reviewed_at'     => 'datetime',
        'approved_at'     => 'datetime',
        'days_requested'  => 'float',
    ];

    protected $attributes = ['status' => 'pending'];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class, 'leave_type_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /** days accessor — reads legacy 'days' column */
    public function getDaysAttribute(): int
    {
        if (isset($this->attributes['days']) && $this->attributes['days'] !== null) {
            return (int) $this->attributes['days'];
        }
        if ($this->start_date && $this->end_date) {
            return $this->start_date->diffInDays($this->end_date) + 1;
        }
        return 0;
    }

    /** Alias for days_requested (phase 83 spec) */
    public function getDaysCountAttribute(): float
    {
        return (float) ($this->attributes['days_requested'] ?? $this->attributes['days'] ?? 0);
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    public function approve(User $approver): void
    {
        if ($this->status !== 'pending') {
            throw new \DomainException("Leave request is already {$this->status}.");
        }

        $daysRequested = (float) ($this->attributes['days_requested'] ?? $this->attributes['days'] ?? 0);

        $this->update([
            'status'      => 'approved',
            'reviewed_by' => $approver->id,
            'reviewed_at' => now(),
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);

        // Update leave balance: pending → used
        $year = $this->start_date ? $this->start_date->year : now()->year;
        $balance = LeaveBalance::where('employee_id', $this->employee_id)
            ->where('leave_type_id', $this->leave_type_id)
            ->where('year', $year)
            ->first();

        if ($balance && $daysRequested > 0) {
            LeaveBalance::where('employee_id', $this->employee_id)
                ->where('leave_type_id', $this->leave_type_id)
                ->where('year', $year)
                ->decrement('pending_days', $daysRequested);

            LeaveBalance::where('employee_id', $this->employee_id)
                ->where('leave_type_id', $this->leave_type_id)
                ->where('year', $year)
                ->increment('used_days', $daysRequested);
        }
    }

    public function reject(User $approver, string $reason = ''): void
    {
        if ($this->status !== 'pending') {
            throw new \DomainException("Leave request is already {$this->status}.");
        }

        $daysRequested = (float) ($this->attributes['days_requested'] ?? $this->attributes['days'] ?? 0);

        $this->update([
            'status'           => 'rejected',
            'rejection_reason' => $reason ?: null,
            'reviewed_by'      => $approver->id,
            'reviewed_at'      => now(),
        ]);

        // Decrement pending_days
        if ($daysRequested > 0) {
            $year = $this->start_date ? $this->start_date->year : now()->year;
            LeaveBalance::where('employee_id', $this->employee_id)
                ->where('leave_type_id', $this->leave_type_id)
                ->where('year', $year)
                ->decrement('pending_days', $daysRequested);
        }
    }

    public function cancel(): void
    {
        $daysRequested = (float) ($this->attributes['days_requested'] ?? $this->attributes['days'] ?? 0);
        $year          = $this->start_date ? $this->start_date->year : now()->year;
        $wasPending    = $this->status === 'pending';
        $wasApproved   = $this->status === 'approved';

        $this->update(['status' => 'cancelled']);

        if ($daysRequested > 0) {
            if ($wasPending) {
                LeaveBalance::where('employee_id', $this->employee_id)
                    ->where('leave_type_id', $this->leave_type_id)
                    ->where('year', $year)
                    ->decrement('pending_days', $daysRequested);
            } elseif ($wasApproved) {
                LeaveBalance::where('employee_id', $this->employee_id)
                    ->where('leave_type_id', $this->leave_type_id)
                    ->where('year', $year)
                    ->decrement('used_days', $daysRequested);
            }
        }
    }
}

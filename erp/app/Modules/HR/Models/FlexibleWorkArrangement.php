<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FlexibleWorkArrangement extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'arrangement_type',
        'start_date',
        'end_date',
        'hours_per_week',
        'description',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
        'approved_at' => 'datetime',
    ];

    protected $attributes = ['status' => 'pending'];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    public function approve(int $userId): void
    {
        $this->update([
            'status'      => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }

    public function reject(string $reason): void
    {
        $this->update([
            'status'           => 'rejected',
            'rejection_reason' => $reason,
        ]);
    }

    public function expire(): void
    {
        $this->update(['status' => 'expired']);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'approved'
            && ($this->end_date === null || $this->end_date->gte(now()->startOfDay()));
    }
}

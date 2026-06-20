<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeExit extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'employee_id', 'exit_date', 'exit_type', 'reason',
        'exit_interview_notes', 'equipment_returned', 'access_revoked',
        'status', 'processed_by', 'processed_at',
    ];

    protected $casts = [
        'exit_date'          => 'date',
        'equipment_returned' => 'boolean',
        'access_revoked'     => 'boolean',
        'processed_at'       => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function complete(int $userId): void
    {
        $this->status       = 'completed';
        $this->processed_by = $userId;
        $this->processed_at = now();
        $this->save();
    }

    public function markInProgress(): void
    {
        $this->status = 'in_progress';
        $this->save();
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsCompleteAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getDaysUntilExitAttribute(): int
    {
        return max(0, (int) now()->diffInDays($this->exit_date, false));
    }
}

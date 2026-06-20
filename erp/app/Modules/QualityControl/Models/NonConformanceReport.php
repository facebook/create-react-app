<?php

namespace App\Modules\QualityControl\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NonConformanceReport extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'inspection_id',
        'ncr_number',
        'title',
        'description',
        'severity',
        'status',
        'reported_by',
        'assigned_to',
        'root_cause',
        'corrective_action',
        'due_date',
        'resolved_at',
    ];

    protected $casts = [
        'due_date'    => 'date',
        'resolved_at' => 'datetime',
    ];

    public static function generateNumber(int $tenantId): string
    {
        $count = static::withoutGlobalScopes()->where('tenant_id', $tenantId)->count();

        return 'NCR-' . str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT);
    }

    public function resolve(string $rootCause, string $correctiveAction): void
    {
        $this->update([
            'resolved_at'        => now(),
            'root_cause'         => $rootCause,
            'corrective_action'  => $correctiveAction,
            'status'             => 'resolved',
        ]);
    }

    public function close(): void
    {
        $this->update(['status' => 'closed']);
    }

    public function isOverdue(): bool
    {
        if ($this->due_date === null) {
            return false;
        }

        return $this->due_date->isPast()
            && ! in_array($this->status, ['resolved', 'closed'], true);
    }

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(QcInspection::class, 'inspection_id');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}

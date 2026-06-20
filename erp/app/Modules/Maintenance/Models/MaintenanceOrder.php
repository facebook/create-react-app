<?php

namespace App\Modules\Maintenance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceOrder extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'equipment_id', 'plan_id', 'order_number',
        'type', 'priority', 'status', 'title', 'description',
        'scheduled_date', 'started_at', 'completed_at',
        'estimated_hours', 'actual_hours', 'assigned_to', 'reported_by',
        'cost', 'notes', 'resolution',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'started_at'     => 'datetime',
        'completed_at'   => 'datetime',
        'estimated_hours' => 'decimal:2',
        'actual_hours'   => 'decimal:2',
        'cost'           => 'decimal:2',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(MaintenancePlan::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public static function generateOrderNumber(int $tenantId): string
    {
        $count = static::withoutGlobalScopes()->where('tenant_id', $tenantId)->count();
        return 'MO-' . str_pad($count + 1, 5, '0', STR_PAD_LEFT);
    }

    public function start(): void
    {
        $this->update([
            'status'     => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function complete(string $resolution, float $actualHours): void
    {
        $this->update([
            'status'       => 'completed',
            'completed_at' => now(),
            'resolution'   => $resolution,
            'actual_hours' => $actualHours,
        ]);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public function isOverdue(): bool
    {
        return $this->scheduled_date
            && $this->scheduled_date->isPast()
            && !in_array($this->status, ['completed', 'cancelled']);
    }
}

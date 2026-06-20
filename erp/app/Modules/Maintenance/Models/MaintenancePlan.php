<?php

namespace App\Modules\Maintenance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenancePlan extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'equipment_id', 'name', 'frequency',
        'estimated_duration_hours', 'description', 'is_active',
        'last_performed_at', 'next_due_at',
    ];

    protected $casts = [
        'is_active'         => 'boolean',
        'last_performed_at' => 'datetime',
        'next_due_at'       => 'datetime',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function calculateNextDue(): Carbon
    {
        return match ($this->frequency) {
            'daily'      => now()->addDay(),
            'weekly'     => now()->addDays(7),
            'monthly'    => now()->addMonth(),
            'quarterly'  => now()->addMonths(3),
            'annual'     => now()->addYear(),
            'as_needed'  => now()->addMonth(),
            default      => now()->addMonth(),
        };
    }

    public function markPerformed(): void
    {
        $this->update([
            'last_performed_at' => now(),
            'next_due_at'       => $this->calculateNextDue(),
        ]);
    }

    public function isDue(): bool
    {
        return $this->next_due_at && $this->next_due_at->isPast();
    }
}

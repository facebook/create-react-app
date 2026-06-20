<?php

namespace App\Modules\Repairs\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RepairOrder extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'order_number',
        'contact_id',
        'product_id',
        'product_name',
        'serial_number',
        'status',
        'priority',
        'diagnosis',
        'internal_notes',
        'warranty_claim',
        'scheduled_date',
        'started_at',
        'completed_at',
        'estimated_hours',
        'actual_hours',
        'estimated_cost',
        'final_cost',
        'assigned_to',
    ];

    protected $casts = [
        'scheduled_date'  => 'date',
        'started_at'      => 'datetime',
        'completed_at'    => 'datetime',
        'warranty_claim'  => 'boolean',
        'estimated_hours' => 'decimal:2',
        'actual_hours'    => 'decimal:2',
        'estimated_cost'  => 'decimal:2',
        'final_cost'      => 'decimal:2',
    ];

    public function lines(): HasMany
    {
        return $this->hasMany(RepairLine::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Finance\Models\Contact::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Inventory\Models\Product::class);
    }

    public static function generateOrderNumber(int $tenantId): string
    {
        $count = static::withoutGlobalScopes()->where('tenant_id', $tenantId)->count();
        return 'RO-' . str_pad($count + 1, 5, '0', STR_PAD_LEFT);
    }

    public function confirm(): void
    {
        $this->update(['status' => 'confirmed']);
    }

    public function start(): void
    {
        $this->update([
            'status'     => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function complete(): void
    {
        $finalCost = $this->lines()->sum('total');
        $this->update([
            'status'       => 'done',
            'completed_at' => now(),
            'final_cost'   => $finalCost,
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
            && !in_array($this->status, ['done', 'cancelled']);
    }

    public function totalPartsValue(): float
    {
        return (float) $this->lines()->where('line_type', 'part')->sum('total');
    }

    public function totalLaborValue(): float
    {
        return (float) $this->lines()->where('line_type', 'labor')->sum('total');
    }
}

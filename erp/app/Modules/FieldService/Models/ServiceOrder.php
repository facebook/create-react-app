<?php

namespace App\Modules\FieldService\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceOrder extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'order_number',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'customer_name',
        'customer_email',
        'customer_phone',
        'address',
        'scheduled_at',
        'started_at',
        'completed_at',
        'estimated_duration',
        'actual_duration',
        'assigned_to',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'scheduled_at'       => 'datetime',
        'started_at'         => 'datetime',
        'completed_at'       => 'datetime',
        'estimated_duration' => 'integer',
        'actual_duration'    => 'integer',
    ];

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ServiceOrderItem::class, 'service_order_id');
    }

    public function checklistResults(): HasMany
    {
        return $this->hasMany(ServiceOrderChecklistResult::class, 'service_order_id');
    }

    public function generateOrderNumber(): string
    {
        return 'FS-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function start(): void
    {
        $this->status     = 'in_progress';
        $this->started_at = now();
        $this->save();
    }

    public function complete(): void
    {
        $this->status       = 'completed';
        $this->completed_at = now();
        $this->actual_duration = $this->started_at
            ? (int) now()->diffInMinutes($this->started_at)
            : null;
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function totalAmount(): float
    {
        return (float) $this->items()->sum('line_total');
    }
}

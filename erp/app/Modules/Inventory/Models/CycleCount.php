<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CycleCount extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'warehouse_id', 'count_number', 'count_date',
        'status', 'notes', 'created_by', 'started_at', 'completed_at',
    ];

    protected $casts = [
        'count_date'   => 'date',
        'started_at'   => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CycleCountItem::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateCountNumber(): string
    {
        return 'CC-' . strtoupper(uniqid());
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
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function getTotalVarianceAttribute(): float
    {
        return (float) $this->items()
            ->whereNotNull('counted_qty')
            ->get()
            ->sum(fn ($i) => abs($i->counted_qty - $i->system_qty));
    }

    public function getItemsCountedAttribute(): int
    {
        return $this->items()->whereNotNull('counted_qty')->count();
    }
}

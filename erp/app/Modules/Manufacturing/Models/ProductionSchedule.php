<?php

namespace App\Modules\Manufacturing\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionSchedule extends Model
{
    use BelongsToTenant;

    protected $table = 'production_schedules';

    protected $fillable = [
        'tenant_id',
        'work_order_id',
        'work_center_id',
        'scheduled_start',
        'scheduled_end',
        'status',
        'notes',
    ];

    protected $casts = [
        'scheduled_start' => 'datetime',
        'scheduled_end'   => 'datetime',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function workCenter(): BelongsTo
    {
        return $this->belongsTo(WorkCenter::class);
    }

    public function durationHours(): float
    {
        return (float) $this->scheduled_start->diffInMinutes($this->scheduled_end) / 60;
    }

    public function confirm(): void
    {
        $this->status = 'confirmed';
        $this->save();
    }

    public function start(): void
    {
        $this->status = 'in_progress';
        $this->save();
    }

    public function complete(): void
    {
        $this->status = 'done';
        $this->save();
    }

    public function overlapsWithWorkCenter(): bool
    {
        return static::where('work_center_id', $this->work_center_id)
            ->where('id', '!=', $this->id ?? 0)
            ->where('status', '!=', 'done')
            ->where(function ($query) {
                $query->where(function ($q) {
                    $q->where('scheduled_start', '<', $this->scheduled_end)
                      ->where('scheduled_end', '>', $this->scheduled_start);
                });
            })
            ->exists();
    }
}

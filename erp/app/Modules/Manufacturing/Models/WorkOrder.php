<?php

namespace App\Modules\Manufacturing\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkOrder extends Model
{
    protected $table = 'work_orders';

    protected $fillable = [
        'manufacturing_order_id', 'work_center_id', 'operation_name',
        'sequence', 'duration_expected', 'duration_actual',
        'scheduled_start', 'actual_start', 'actual_finish',
        'status', 'notes',
    ];

    protected $casts = [
        'duration_expected' => 'float',
        'duration_actual'   => 'float',
        'sequence'          => 'integer',
        'scheduled_start'   => 'datetime',
        'actual_start'      => 'datetime',
        'actual_finish'     => 'datetime',
    ];

    public function manufacturingOrder(): BelongsTo
    {
        return $this->belongsTo(ManufacturingOrder::class);
    }

    public function workCenter(): BelongsTo
    {
        return $this->belongsTo(WorkCenter::class);
    }

    public function productionSchedules(): HasMany
    {
        return $this->hasMany(ProductionSchedule::class);
    }

    public function start(): void
    {
        $this->status      = 'in_progress';
        $this->actual_start = now();
        $this->save();
    }

    public function finish(): void
    {
        $this->status       = 'done';
        $this->actual_finish = now();
        if ($this->actual_start) {
            $this->duration_actual = $this->actual_start->diffInMinutes($this->actual_finish);
        }
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    protected function durationLabel(): Attribute
    {
        return Attribute::make(get: function () {
            $minutes = (int) $this->duration_expected;
            $hours   = intdiv($minutes, 60);
            $mins    = $minutes % 60;
            return $hours > 0 ? "{$hours}h {$mins}m" : "{$mins}m";
        });
    }

    protected function isOverdue(): Attribute
    {
        return Attribute::make(get: function () {
            if ($this->status !== 'in_progress' || ! $this->scheduled_start) {
                return false;
            }
            $deadline = $this->scheduled_start->copy()->addMinutes((int) $this->duration_expected);
            return now()->gt($deadline);
        });
    }
}

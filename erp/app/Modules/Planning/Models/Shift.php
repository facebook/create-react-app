<?php

namespace App\Modules\Planning\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shift extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'title',
        'starts_at',
        'ends_at',
        'break_minutes',
        'status',
        'notes',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function swaps(): HasMany
    {
        return $this->hasMany(ShiftSwap::class);
    }

    public function durationMinutes(): int
    {
        return (int) $this->starts_at->diffInMinutes($this->ends_at) - $this->break_minutes;
    }

    public function durationHours(): float
    {
        return $this->durationMinutes() / 60;
    }

    public function confirm(): void
    {
        $this->update(['status' => 'confirmed']);
    }

    public function complete(): void
    {
        $this->update(['status' => 'completed']);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public function overlapsWithUserShifts(): bool
    {
        return static::withoutGlobalScopes()
            ->where('employee_id', $this->employee_id)
            ->where('id', '!=', $this->id ?? 0)
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) {
                $q->where(function ($q2) {
                    $q2->where('starts_at', '<', $this->ends_at)
                        ->where('ends_at', '>', $this->starts_at);
                });
            })
            ->exists();
    }
}

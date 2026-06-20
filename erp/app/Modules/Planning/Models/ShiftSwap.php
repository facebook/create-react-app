<?php

namespace App\Modules\Planning\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftSwap extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'shift_id',
        'requested_by',
        'requested_to',
        'reason',
        'status',
        'responded_at',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
    ];

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function target(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_to');
    }

    public function approve(): void
    {
        $this->update([
            'status'       => 'approved',
            'responded_at' => now(),
        ]);
        $this->shift->update(['employee_id' => $this->requested_to]);
    }

    public function reject(): void
    {
        $this->update([
            'status'       => 'rejected',
            'responded_at' => now(),
        ]);
    }
}

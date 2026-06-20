<?php

namespace App\Modules\Frontdesk\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitorLog extends Model
{
    use BelongsToTenant;

    protected $table = 'visitor_logs';

    protected $fillable = [
        'tenant_id',
        'station_id',
        'visitor_name',
        'visitor_email',
        'visitor_phone',
        'visitor_company',
        'visit_purpose',
        'host_employee_id',
        'badge_number',
        'status',
        'expected_at',
        'check_in_at',
        'check_out_at',
        'visitor_photo_path',
        'notes',
    ];

    protected $casts = [
        'expected_at'  => 'datetime',
        'check_in_at'  => 'datetime',
        'check_out_at' => 'datetime',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(FrontdeskStation::class, 'station_id');
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_employee_id');
    }

    public function checkIn(): void
    {
        $this->update([
            'status'      => 'checked_in',
            'check_in_at' => now(),
        ]);
    }

    public function checkOut(): void
    {
        $this->update([
            'status'       => 'checked_out',
            'check_out_at' => now(),
        ]);
    }

    public function markNoShow(): void
    {
        $this->update(['status' => 'no_show']);
    }

    public function durationMinutes(): ?int
    {
        if ($this->check_in_at && $this->check_out_at) {
            return (int) $this->check_in_at->diffInMinutes($this->check_out_at);
        }

        return null;
    }

    public function generateBadge(): string
    {
        return 'VIS-' . strtoupper(substr($this->visitor_name, 0, 3)) . '-' . str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }
}

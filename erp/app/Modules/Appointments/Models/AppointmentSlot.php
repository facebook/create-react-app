<?php

namespace App\Modules\Appointments\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AppointmentSlot extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'appointment_type_id',
        'staff_user_id',
        'start_at',
        'end_at',
        'capacity',
        'booked_count',
        'is_available',
    ];

    protected $casts = [
        'start_at'     => 'datetime',
        'end_at'       => 'datetime',
        'is_available' => 'boolean',
        'capacity'     => 'integer',
        'booked_count' => 'integer',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(AppointmentType::class, 'appointment_type_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function isFull(): bool
    {
        return $this->booked_count >= $this->capacity;
    }
}

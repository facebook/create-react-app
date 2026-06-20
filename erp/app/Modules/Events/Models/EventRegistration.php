<?php

namespace App\Modules\Events\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRegistration extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'event_id',
        'tenant_id',
        'attendee_name',
        'attendee_email',
        'status',
        'registered_at',
        'notes',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function confirm(): void
    {
        $this->status = 'confirmed';
        $this->save();
    }

    public function markAttended(): void
    {
        $this->status = 'attended';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }
}

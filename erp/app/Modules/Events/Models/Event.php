<?php

namespace App\Modules\Events\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'title',
        'description',
        'location',
        'starts_at',
        'ends_at',
        'capacity',
        'status',
        'organizer_id',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function publish(): void
    {
        $this->status = 'published';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function registrationCount(): int
    {
        return $this->registrations()->count();
    }

    public function availableSpots(): ?int
    {
        if ($this->capacity === null) {
            return null;
        }

        return $this->capacity - $this->registrationCount();
    }

    public function isFull(): bool
    {
        return $this->capacity !== null && $this->registrationCount() >= $this->capacity;
    }

    public function isOpen(): bool
    {
        return $this->status === 'published'
            && ! $this->isFull()
            && ($this->ends_at === null || $this->ends_at->gt(now()));
    }
}

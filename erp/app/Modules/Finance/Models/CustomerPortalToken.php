<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CustomerPortalToken extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'contact_id',
        'token',
        'email',
        'expires_at',
        'last_accessed_at',
    ];

    protected $casts = [
        'expires_at'       => 'datetime',
        'last_accessed_at' => 'datetime',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function getIsExpiredAttribute(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }

        return $this->expires_at->isPast();
    }

    public static function generate(int $tenantId, int $contactId, string $email, int $days = 30): self
    {
        $token = bin2hex(random_bytes(32)); // 64-char hex string

        return static::create([
            'tenant_id'  => $tenantId,
            'contact_id' => $contactId,
            'token'      => $token,
            'email'      => $email,
            'expires_at' => now()->addDays($days),
        ]);
    }
}

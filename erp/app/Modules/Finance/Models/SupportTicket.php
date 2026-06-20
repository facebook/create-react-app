<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SupportTicket extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'reference',
        'subject',
        'description',
        'status',
        'priority',
        'category',
        'contact_id',
        'assigned_to',
        'created_by',
        'resolved_at',
        'closed_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at'   => 'datetime',
    ];

    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'contact_id');
    }

    public static function generateReference(int $tenantId): string
    {
        return 'TKT-' . str_pad(
            SupportTicket::where('tenant_id', $tenantId)->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );
    }

    public function resolve(): void
    {
        $this->status      = 'resolved';
        $this->resolved_at = now();
        $this->save();
    }

    public function close(): void
    {
        $this->status   = 'closed';
        $this->closed_at = now();
        $this->save();
    }

    public function reopen(): void
    {
        $this->status      = 'open';
        $this->resolved_at = null;
        $this->closed_at   = null;
        $this->save();
    }

    public function assign(int $userId): void
    {
        $this->assigned_to = $userId;
        if ($this->status === 'open') {
            $this->status = 'in_progress';
        }
        $this->save();
    }

    public function getIsOpenAttribute(): bool
    {
        return $this->status === 'open' || $this->status === 'in_progress';
    }

    public function getResponseTimeHoursAttribute(): ?float
    {
        if ($this->resolved_at === null) {
            return null;
        }

        return round($this->created_at->diffInMinutes($this->resolved_at) / 60, 1);
    }
}

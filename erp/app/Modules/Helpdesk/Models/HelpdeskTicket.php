<?php

namespace App\Modules\Helpdesk\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class HelpdeskTicket extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'helpdesk_tickets';

    protected $fillable = [
        'tenant_id',
        'ticket_number',
        'subject',
        'description',
        'type',
        'priority',
        'status',
        'team_id',
        'assigned_to',
        'customer_name',
        'customer_email',
        'sla_deadline',
        'first_response_at',
        'resolved_at',
        'closed_at',
        'created_by',
    ];

    protected $casts = [
        'sla_deadline'       => 'datetime',
        'first_response_at'  => 'datetime',
        'resolved_at'        => 'datetime',
        'closed_at'          => 'datetime',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(HelpdeskTeam::class, 'team_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(HelpdeskMessage::class, 'ticket_id')->orderBy('created_at');
    }

    public function generateTicketNumber(): string
    {
        return 'HD-' . date('Y') . '-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
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

    public function recordFirstResponse(): void
    {
        if ($this->first_response_at === null) {
            $this->first_response_at = now();
            $this->save();
        }
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->sla_deadline !== null
            && now()->gt($this->sla_deadline)
            && !in_array($this->status, ['resolved', 'closed']);
    }

    public function getPriorityColorAttribute(): string
    {
        return match ($this->priority) {
            'low'    => 'blue',
            'medium' => 'yellow',
            'high'   => 'orange',
            'urgent' => 'red',
            default  => 'gray',
        };
    }
}

<?php

namespace App\Modules\Helpdesk\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketEscalation extends Model
{
    use BelongsToTenant;

    protected $table = 'helpdesk_ticket_escalations';

    protected $fillable = [
        'tenant_id',
        'ticket_id',
        'escalation_type',
        'escalated_at',
        'resolved_at',
        'escalated_to_id',
        'notes',
    ];

    protected $casts = [
        'escalated_at' => 'datetime',
        'resolved_at'  => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(HelpdeskTicket::class, 'ticket_id');
    }

    public function escalatedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalated_to_id');
    }

    public function resolve(string $notes = ''): void
    {
        $this->resolved_at = now();
        if ($notes) {
            $this->notes = $notes;
        }
        $this->save();
    }

    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }
}

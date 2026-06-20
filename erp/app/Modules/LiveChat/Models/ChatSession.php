<?php

namespace App\Modules\LiveChat\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatSession extends Model
{
    use BelongsToTenant;

    protected $table = 'chat_sessions';

    protected $fillable = [
        'tenant_id',
        'channel_id',
        'visitor_name',
        'visitor_email',
        'source_url',
        'status',
        'assigned_agent_id',
        'rating',
        'rating_note',
        'started_at',
        'ended_at',
        'last_message_at',
    ];

    protected $casts = [
        'started_at'      => 'datetime',
        'ended_at'        => 'datetime',
        'last_message_at' => 'datetime',
        'rating'          => 'integer',
    ];

    public function channel(): BelongsTo
    {
        return $this->belongsTo(ChatChannel::class, 'channel_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'session_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_agent_id');
    }

    public function assign(int $agentId): void
    {
        $this->update([
            'status'            => 'assigned',
            'assigned_agent_id' => $agentId,
        ]);
    }

    public function resolve(): void
    {
        $this->update([
            'status'   => 'resolved',
            'ended_at' => now(),
        ]);
    }

    public function markMissed(): void
    {
        $this->update([
            'status'   => 'missed',
            'ended_at' => now(),
        ]);
    }

    public function unreadCount(): int
    {
        return $this->messages()
            ->where('is_read', false)
            ->where('sender_type', 'visitor')
            ->count();
    }

    public function duration(): ?int
    {
        if ($this->started_at && $this->ended_at) {
            return (int) $this->started_at->diffInMinutes($this->ended_at);
        }

        return null;
    }
}

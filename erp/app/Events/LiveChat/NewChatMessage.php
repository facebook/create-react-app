<?php

namespace App\Events\LiveChat;

use App\Modules\LiveChat\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewChatMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly ChatMessage $message) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat-session.' . $this->message->session_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id'          => $this->message->id,
            'session_id'  => $this->message->session_id,
            'sender_type' => $this->message->sender_type,
            'agent_id'    => $this->message->agent_id,
            'message'     => $this->message->message,
            'created_at'  => $this->message->created_at?->toIso8601String(),
        ];
    }
}

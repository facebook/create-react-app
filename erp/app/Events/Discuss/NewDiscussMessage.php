<?php

namespace App\Events\Discuss;

use App\Modules\Discuss\Models\DiscussMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewDiscussMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly DiscussMessage $message) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('discuss-channel.' . $this->message->channel_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id'         => $this->message->id,
            'channel_id' => $this->message->channel_id,
            'user_id'    => $this->message->user_id,
            'body'       => $this->message->body,
            'parent_id'  => $this->message->parent_id,
            'is_edited'  => (bool) $this->message->is_edited,
            'created_at' => $this->message->created_at?->toIso8601String(),
            'user'       => $this->message->relationLoaded('user')
                ? ['id' => $this->message->user->id, 'name' => $this->message->user->name]
                : null,
        ];
    }
}

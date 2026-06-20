<?php

use App\Events\Discuss\NewDiscussMessage;
use App\Events\LiveChat\NewChatMessage;
use App\Events\Notifications\ErpNotification;
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Discuss\Models\DiscussChannel;
use App\Modules\Discuss\Models\DiscussMessage;
use App\Modules\LiveChat\Models\ChatChannel;
use App\Modules\LiveChat\Models\ChatMessage;
use App\Modules\LiveChat\Models\ChatSession;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Broadcast Co', 'slug' => 'broadcast-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    app()->instance('tenant', $this->tenant);
});

it('NewChatMessage event broadcasts on the correct private channel', function () {
    $channel = ChatChannel::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Support',
        'identifier' => 'support',
    ]);

    $session = ChatSession::create([
        'tenant_id'  => $this->tenant->id,
        'channel_id' => $channel->id,
        'status'     => 'open',
    ]);

    $msg = ChatMessage::create([
        'tenant_id'   => $this->tenant->id,
        'session_id'  => $session->id,
        'sender_type' => 'agent',
        'agent_id'    => $this->user->id,
        'message'     => 'Hello visitor!',
    ]);

    $event = new NewChatMessage($msg);

    $channels = $event->broadcastOn();
    expect($channels)->toHaveCount(1);
    expect($channels[0]->name)->toBe('private-chat-session.' . $session->id);

    $payload = $event->broadcastWith();
    expect($payload['message'])->toBe('Hello visitor!');
    expect($payload['sender_type'])->toBe('agent');
    expect($payload['session_id'])->toBe($session->id);
});

it('NewDiscussMessage event broadcasts on the correct private channel', function () {
    $channel = DiscussChannel::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'general',
        'slug'       => 'general',
        'type'       => 'public',
        'created_by' => $this->user->id,
    ]);

    $msg = DiscussMessage::create([
        'tenant_id'  => $this->tenant->id,
        'channel_id' => $channel->id,
        'user_id'    => $this->user->id,
        'body'       => 'Hello team!',
    ]);

    $event = new NewDiscussMessage($msg);

    $channels = $event->broadcastOn();
    expect($channels)->toHaveCount(1);
    expect($channels[0]->name)->toBe('private-discuss-channel.' . $channel->id);

    $payload = $event->broadcastWith();
    expect($payload['body'])->toBe('Hello team!');
    expect($payload['channel_id'])->toBe($channel->id);
});

it('ErpNotification event broadcasts on the tenant private channel', function () {
    $event = new ErpNotification(
        tenantId: $this->tenant->id,
        type:     'low_stock',
        title:    'Low Stock Alert',
        message:  'Widget B is below reorder point',
        data:     ['product_id' => 42],
    );

    $channels = $event->broadcastOn();
    expect($channels)->toHaveCount(1);
    expect($channels[0]->name)->toBe('private-tenant.' . $this->tenant->id);

    $payload = $event->broadcastWith();
    expect($payload['type'])->toBe('low_stock');
    expect($payload['title'])->toBe('Low Stock Alert');
    expect($payload['data']['product_id'])->toBe(42);
});

it('dispatches NewChatMessage event when agent sends message via controller', function () {
    Event::fake([NewChatMessage::class]);

    $channel = ChatChannel::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Support2',
        'identifier' => 'support2',
    ]);

    $session = ChatSession::create([
        'tenant_id'  => $this->tenant->id,
        'channel_id' => $channel->id,
        'status'     => 'open',
    ]);

    $this->actingAs($this->user)
         ->post("/live-chat/sessions/{$session->id}/messages", ['message' => 'Hi there!'])
         ->assertRedirect();

    Event::assertDispatched(NewChatMessage::class, function ($e) use ($session) {
        return $e->message->session_id === $session->id
            && $e->message->message === 'Hi there!';
    });
});

it('dispatches NewDiscussMessage event when user sends message in channel', function () {
    Event::fake([NewDiscussMessage::class]);

    $channel = DiscussChannel::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'team',
        'slug'       => 'team',
        'type'       => 'public',
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
         ->postJson("/discuss/{$channel->id}/messages", ['body' => 'Good morning!'])
         ->assertStatus(201);

    Event::assertDispatched(NewDiscussMessage::class, function ($e) use ($channel) {
        return $e->message->channel_id === $channel->id
            && $e->message->body === 'Good morning!';
    });
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\LiveChat\Models\ChatChannel;
use App\Modules\LiveChat\Models\ChatMessage;
use App\Modules\LiveChat\Models\ChatSession;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Chat Corp', 'slug' => 'chat-corp-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

function makeLiveChatChannel(array $overrides = []): ChatChannel
{
    return ChatChannel::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Support ' . uniqid(),
        'is_active' => true,
    ], $overrides));
}

function makeLiveChatSession(ChatChannel $channel, array $overrides = []): ChatSession
{
    return ChatSession::create(array_merge([
        'tenant_id'    => test()->tenant->id,
        'channel_id'   => $channel->id,
        'visitor_name' => 'Test Visitor',
        'status'       => 'open',
        'started_at'   => now(),
    ], $overrides));
}

function makeLiveChatMessage(ChatSession $session, array $overrides = []): ChatMessage
{
    return ChatMessage::create(array_merge([
        'tenant_id'   => test()->tenant->id,
        'session_id'  => $session->id,
        'sender_type' => 'visitor',
        'message'     => 'Hello, I need help!',
    ], $overrides));
}

it('live chat dashboard renders', function () {
    $this->get('/live-chat/dashboard')->assertStatus(200)->assertInertia(
        fn ($page) => $page->component('LiveChat/Dashboard')
    );
});

it('live chat channels index renders', function () {
    $this->get('/live-chat/channels')->assertStatus(200);
});

it('can create a live chat channel', function () {
    $this->post('/live-chat/channels', [
        'name'         => 'Sales Chat',
        'widget_color' => '#123456',
    ])->assertRedirect();

    expect(ChatChannel::withoutGlobalScopes()->where('name', 'Sales Chat')->exists())->toBeTrue();
});

it('live chat sessions index renders', function () {
    $this->get('/live-chat/sessions')->assertStatus(200);
});

it('live chat session show renders', function () {
    $channel = makeLiveChatChannel();
    $session = makeLiveChatSession($channel);

    $this->get("/live-chat/sessions/{$session->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('LiveChat/Sessions/Show'));
});

it('can assign live chat session to agent', function () {
    $channel = makeLiveChatChannel();
    $session = makeLiveChatSession($channel);

    $this->post("/live-chat/sessions/{$session->id}/assign", [
        'agent_id' => test()->user->id,
    ])->assertRedirect();

    expect($session->fresh()->status)->toBe('assigned');
    expect($session->fresh()->assigned_agent_id)->toBe(test()->user->id);
});

it('can resolve a live chat session', function () {
    $channel = makeLiveChatChannel();
    $session = makeLiveChatSession($channel);

    $this->post("/live-chat/sessions/{$session->id}/resolve")->assertRedirect();

    expect($session->fresh()->status)->toBe('resolved');
});

it('can send agent message in live chat session', function () {
    $channel = makeLiveChatChannel();
    $session = makeLiveChatSession($channel);

    $this->post("/live-chat/sessions/{$session->id}/messages", [
        'message' => 'Hello, how can I help you?',
    ])->assertRedirect();

    expect(
        ChatMessage::withoutGlobalScopes()
            ->where('session_id', $session->id)
            ->where('sender_type', 'agent')
            ->where('message', 'Hello, how can I help you?')
            ->exists()
    )->toBeTrue();
});

it('widget can create a live chat session', function () {
    $channel = makeLiveChatChannel();

    $response = $this->post('/chat-widget/session', [
        'channel_id'   => $channel->id,
        'visitor_name' => 'Jane Doe',
    ]);

    $response->assertStatus(200)->assertJsonStructure(['session_id', 'token']);
});

it('widget can send a visitor message', function () {
    $channel = makeLiveChatChannel();
    $session = makeLiveChatSession($channel);

    $response = $this->post('/chat-widget/message', [
        'session_id' => $session->id,
        'message'    => 'I need help with my order!',
    ]);

    $response->assertStatus(200)->assertJson(['success' => true]);

    expect(
        ChatMessage::withoutGlobalScopes()
            ->where('session_id', $session->id)
            ->where('sender_type', 'visitor')
            ->where('message', 'I need help with my order!')
            ->exists()
    )->toBeTrue();
});

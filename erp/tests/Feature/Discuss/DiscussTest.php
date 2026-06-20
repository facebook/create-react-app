<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Discuss\Models\DiscussChannel;
use App\Modules\Discuss\Models\DiscussMessage;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Chat Co', 'slug' => 'chat-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

it('discuss index returns 200', function () {
    $this->get('/discuss')->assertStatus(200);
});

it('can create a public channel', function () {
    $this->post('/discuss', ['name' => 'general', 'type' => 'public'])
         ->assertRedirect();
    expect(DiscussChannel::where('name', 'general')->exists())->toBeTrue();
});

it('channel creator becomes a member', function () {
    $this->post('/discuss', ['name' => 'team', 'type' => 'public']);
    $channel = DiscussChannel::where('name', 'team')->first();
    expect($channel->members()->where('user_id', test()->user->id)->exists())->toBeTrue();
});

it('can view channel', function () {
    $channel = DiscussChannel::createPublic(test()->tenant->id, test()->user->id, 'dev');
    $this->get("/discuss/{$channel->id}")->assertStatus(200);
});

it('can send a message', function () {
    $channel = DiscussChannel::createPublic(test()->tenant->id, test()->user->id, 'dev');
    $this->postJson("/discuss/{$channel->id}/messages", ['body' => 'Hello world'])
         ->assertStatus(201)
         ->assertJsonFragment(['body' => 'Hello world']);
    expect(DiscussMessage::where('body', 'Hello world')->exists())->toBeTrue();
});

it('message requires body', function () {
    $channel = DiscussChannel::createPublic(test()->tenant->id, test()->user->id, 'dev');
    $this->postJson("/discuss/{$channel->id}/messages", ['body' => ''])
         ->assertStatus(422);
});

it('can edit own message', function () {
    $channel = DiscussChannel::createPublic(test()->tenant->id, test()->user->id, 'dev');
    $msg = DiscussMessage::create([
        'tenant_id'  => test()->tenant->id,
        'channel_id' => $channel->id,
        'user_id'    => test()->user->id,
        'body'       => 'Old body',
    ]);
    $this->patchJson("/discuss/{$channel->id}/messages/{$msg->id}", ['body' => 'New body'])
         ->assertStatus(200)
         ->assertJson(['ok' => true]);
    expect($msg->fresh()->body)->toBe('New body');
    expect($msg->fresh()->is_edited)->toBeTrue();
});

it('cannot edit another users message', function () {
    $other = User::factory()->create(['tenant_id' => test()->tenant->id]);
    $channel = DiscussChannel::createPublic(test()->tenant->id, test()->user->id, 'dev');
    $msg = DiscussMessage::create([
        'tenant_id'  => test()->tenant->id,
        'channel_id' => $channel->id,
        'user_id'    => $other->id,
        'body'       => 'Not mine',
    ]);
    $this->patchJson("/discuss/{$channel->id}/messages/{$msg->id}", ['body' => 'Hacked'])
         ->assertStatus(403);
});

it('can delete own message', function () {
    $channel = DiscussChannel::createPublic(test()->tenant->id, test()->user->id, 'dev');
    $msg = DiscussMessage::create([
        'tenant_id'  => test()->tenant->id,
        'channel_id' => $channel->id,
        'user_id'    => test()->user->id,
        'body'       => 'Delete me',
    ]);
    $this->deleteJson("/discuss/{$channel->id}/messages/{$msg->id}")
         ->assertStatus(200);
    $this->assertSoftDeleted('discuss_messages', ['id' => $msg->id]);
});

it('can join a public channel', function () {
    $other = User::factory()->create(['tenant_id' => test()->tenant->id]);
    $channel = DiscussChannel::createPublic(test()->tenant->id, $other->id, 'open');
    $this->post("/discuss/{$channel->id}/join")->assertRedirect();
    expect($channel->members()->where('user_id', test()->user->id)->exists())->toBeTrue();
});

it('can leave a channel', function () {
    $channel = DiscussChannel::createPublic(test()->tenant->id, test()->user->id, 'bye');
    $this->delete("/discuss/{$channel->id}/leave")->assertRedirect();
    expect($channel->members()->where('user_id', test()->user->id)->exists())->toBeFalse();
});

it('unread count increments after message', function () {
    $other = User::factory()->create(['tenant_id' => test()->tenant->id]);
    $channel = DiscussChannel::createPublic(test()->tenant->id, test()->user->id, 'unread-test');
    $channel->members()->syncWithoutDetaching([$other->id => ['last_read_at' => now()->subMinute()]]);

    DiscussMessage::create([
        'tenant_id'  => test()->tenant->id,
        'channel_id' => $channel->id,
        'user_id'    => test()->user->id,
        'body'       => 'Unread!',
    ]);

    expect($channel->getUnreadCountFor($other->id))->toBe(1);
});

it('mark_read resets unread count', function () {
    $other = User::factory()->create(['tenant_id' => test()->tenant->id]);
    $channel = DiscussChannel::createPublic(test()->tenant->id, test()->user->id, 'read-test');
    $channel->members()->syncWithoutDetaching([$other->id => ['last_read_at' => now()->subHour()]]);
    DiscussMessage::create([
        'tenant_id'  => test()->tenant->id,
        'channel_id' => $channel->id,
        'user_id'    => test()->user->id,
        'body'       => 'Hello',
    ]);
    $channel->markReadFor($other->id);
    expect($channel->getUnreadCountFor($other->id))->toBe(0);
});

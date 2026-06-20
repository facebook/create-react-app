<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\LiveChat\Models\ChatChannel;
use App\Modules\LiveChat\Models\ChatSession;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Chat Co', 'slug' => 'chat-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns channels for authenticated user', function () {
    ChatChannel::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Support Channel',
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/live-chat/channels');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for channels', function () {
    $this->getJson('/api/v1/live-chat/channels')->assertStatus(401);
});

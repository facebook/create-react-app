<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;

it('returns events for authenticated user', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $token = $user->createToken('test')->plainTextToken;
    $response = $this->withToken($token)->getJson('/api/v1/events');
    $response->assertStatus(200)->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for events', function () {
    $this->getJson('/api/v1/events')->assertStatus(401);
});

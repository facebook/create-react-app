<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;

it('returns field service tasks for authenticated user', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $token = $user->createToken('test')->plainTextToken;
    $response = $this->withToken($token)->getJson('/api/v1/field-service/tasks');
    $response->assertStatus(200)->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for field service tasks', function () {
    $this->getJson('/api/v1/field-service/tasks')->assertStatus(401);
});

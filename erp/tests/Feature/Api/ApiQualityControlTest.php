<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;

it('returns quality inspections for authenticated user', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $token = $user->createToken('test')->plainTextToken;
    $response = $this->withToken($token)->getJson('/api/v1/quality/inspections');
    $response->assertStatus(200)->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for quality control api', function () {
    $this->getJson('/api/v1/quality/inspections')->assertStatus(401);
});

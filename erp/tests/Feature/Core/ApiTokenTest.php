<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Token Co', 'slug' => 'token-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('main')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can list api tokens', function () {
    $this->user->createToken('Second Token', ['read:invoices']);

    $this->withToken($this->token)
        ->getJson('/api/v1/tokens')
        ->assertStatus(200);

    $tokens = $this->withToken($this->token)->getJson('/api/v1/tokens')->json('data');
    expect(count($tokens))->toBeGreaterThanOrEqual(2);
});

test('can create an api token with abilities', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/tokens', [
            'name'      => 'Reporting Token',
            'abilities' => ['read:invoices', 'read:reports'],
        ])
        ->assertStatus(201)
        ->assertJsonStructure(['data' => ['token', 'id', 'name', 'abilities', 'expires_at']])
        ->assertJsonPath('data.name', 'Reporting Token');
});

test('can create a token with expiry', function () {
    $response = $this->withToken($this->token)
        ->postJson('/api/v1/tokens', [
            'name'       => 'Temp Token',
            'expires_in' => 7,
        ])
        ->assertStatus(201);

    $expiresAt = $response->json('data.expires_at');
    expect($expiresAt)->not->toBeNull();
});

test('store validates ability names', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/tokens', [
            'name'      => 'Bad Token',
            'abilities' => ['hack:everything'],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['abilities.0']);
});

test('can revoke a specific token', function () {
    $newToken = $this->user->createToken('Revoke Me');
    $tokenId  = $newToken->accessToken->id;

    $this->withToken($this->token)
        ->deleteJson("/api/v1/tokens/{$tokenId}")
        ->assertStatus(200);

    expect($this->user->tokens()->where('id', $tokenId)->count())->toBe(0);
});

test('cannot revoke another users token', function () {
    $otherUser  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $otherToken = $otherUser->createToken('Other Token');
    $tokenId    = $otherToken->accessToken->id;

    $this->withToken($this->token)
        ->deleteJson("/api/v1/tokens/{$tokenId}")
        ->assertStatus(404);
});

test('can revoke all tokens', function () {
    $this->user->createToken('Token A');
    $this->user->createToken('Token B');

    $this->withToken($this->token)
        ->deleteJson('/api/v1/tokens/all')
        ->assertStatus(200);

    expect($this->user->tokens()->count())->toBe(0);
});

test('token with wildcard ability works as full access', function () {
    $response = $this->withToken($this->token)
        ->postJson('/api/v1/tokens', [
            'name' => 'Full Access',
        ])
        ->assertStatus(201);

    $abilities = $response->json('data.abilities');
    expect($abilities)->toContain('*');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/tokens')->assertStatus(401);
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'API Co', 'slug' => 'api-co']);
    $this->user   = User::factory()->create([
        'tenant_id' => $this->tenant->id,
        'password'  => bcrypt('password'),
    ]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('login with valid credentials returns token', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email'    => $this->user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'success',
                 'data' => [
                     'token',
                     'user' => ['id', 'name', 'email', 'tenant_id'],
                 ],
             ])
             ->assertJson(['success' => true]);
});

test('login with invalid credentials returns 401', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email'    => $this->user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401)
             ->assertJson(['success' => false]);
});

test('login validation fails without email', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'password' => 'password',
    ]);

    $response->assertStatus(422);
});

test('protected routes reject unauthenticated requests', function () {
    $response = $this->getJson('/api/v1/auth/me');

    $response->assertStatus(401);
});

test('me endpoint returns authenticated user data', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/auth/me');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'success',
                 'data' => ['id', 'name', 'email', 'tenant_id'],
             ])
             ->assertJson([
                 'success' => true,
                 'data'    => [
                     'id'    => $this->user->id,
                     'email' => $this->user->email,
                 ],
             ]);
});

test('logout invalidates token', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/auth/logout');

    $response->assertStatus(200)
             ->assertJson(['success' => true]);

    // Verify the token was deleted from the database
    $this->assertDatabaseMissing('personal_access_tokens', [
        'tokenable_id'   => $this->user->id,
        'tokenable_type' => \App\Models\User::class,
    ]);
});

test('me returns tenant information', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/auth/me');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'data' => ['tenant' => ['id', 'name', 'slug']],
             ]);
});

test('dashboard requires authentication', function () {
    $this->getJson('/api/v1/dashboard')->assertStatus(401);
});

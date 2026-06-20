<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

test('health check returns 200 when system is healthy', function () {
    $response = $this->getJson('/api/v1/health');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'timestamp',
            'version',
            'checks' => [
                'database',
                'cache',
                'queue',
                'storage',
            ],
        ]);

    expect($response->json('status'))->toBeIn(['healthy', 'degraded']);
    expect($response->json('checks.database.status'))->toBe('healthy');
});

test('health check does not require authentication', function () {
    $this->getJson('/api/v1/health')->assertStatus(200);
});

test('metrics endpoint requires authentication', function () {
    $this->getJson('/api/v1/metrics')->assertStatus(401);
});

test('metrics endpoint returns system stats when authenticated', function () {
    $this->seed(RolePermissionSeeder::class);
    $tenant = Tenant::create(['name' => 'Health Co', 'slug' => 'health-co-' . uniqid()]);
    $user   = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole('super-admin');
    $token  = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)->getJson('/api/v1/metrics');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'tenants',
                'users',
                'queue_jobs',
                'memory_usage_mb',
                'php_version',
                'laravel_version',
            ],
        ]);

    expect($response->json('data.php_version'))->toContain('8.');
    expect($response->json('data.tenants'))->toBeGreaterThan(0);
});

test('health check includes queue status', function () {
    $response = $this->getJson('/api/v1/health');
    $response->assertStatus(200);

    $queue = $response->json('checks.queue');
    expect($queue)->toHaveKey('status');
    expect($queue['status'])->toBeIn(['healthy', 'degraded']);
});

test('health check includes cache status', function () {
    $response = $this->getJson('/api/v1/health');
    $response->assertStatus(200);

    $cache = $response->json('checks.cache');
    expect($cache['status'])->toBeIn(['healthy', 'degraded']);
});

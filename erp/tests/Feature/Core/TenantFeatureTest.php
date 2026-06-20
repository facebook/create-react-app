<?php

use App\Models\TenantFeature;
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Feature Co', 'slug' => 'feature-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can list all available features with defaults', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/features');

    $response->assertStatus(200);
    $features = $response->json('data');
    expect($features)->not->toBeEmpty();
    expect($features[0])->toHaveKeys(['feature', 'description', 'is_enabled']);
});

test('features default to enabled when no record exists', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/features/webhooks/check');

    $response->assertStatus(200);
    expect($response->json('data.is_enabled'))->toBeTrue();
});

test('can toggle a feature off', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/features/toggle', [
        'feature'    => 'webhooks',
        'is_enabled' => false,
    ]);

    $response->assertStatus(200);
    expect(TenantFeature::isEnabled($this->tenant->id, 'webhooks'))->toBeFalse();
});

test('can toggle a feature on', function () {
    TenantFeature::create([
        'tenant_id'  => $this->tenant->id,
        'feature'    => 'customer_portal',
        'is_enabled' => false,
    ]);

    $this->withToken($this->token)->postJson('/api/v1/features/toggle', [
        'feature'    => 'customer_portal',
        'is_enabled' => true,
    ])->assertStatus(200);

    expect(TenantFeature::isEnabled($this->tenant->id, 'customer_portal'))->toBeTrue();
});

test('toggle validates feature must be known', function () {
    $this->withToken($this->token)->postJson('/api/v1/features/toggle', [
        'feature'    => 'unknown_feature',
        'is_enabled' => false,
    ])->assertStatus(422)->assertJsonValidationErrors(['feature']);
});

test('can store config with feature toggle', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/features/toggle', [
        'feature'    => 'api_access',
        'is_enabled' => true,
        'config'     => ['rate_limit' => 120],
    ]);

    $response->assertStatus(200);
    $feature = TenantFeature::where('tenant_id', $this->tenant->id)->where('feature', 'api_access')->first();
    expect($feature->config['rate_limit'])->toBe(120);
});

test('check endpoint returns feature status', function () {
    TenantFeature::create([
        'tenant_id'  => $this->tenant->id,
        'feature'    => 'sso',
        'is_enabled' => false,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/features/sso/check');
    $response->assertStatus(200);
    expect($response->json('data.is_enabled'))->toBeFalse();
});

test('feature cache is invalidated on toggle', function () {
    Cache::put("tenant_feature_{$this->tenant->id}_audit_log", true, 300);

    $this->withToken($this->token)->postJson('/api/v1/features/toggle', [
        'feature'    => 'audit_log',
        'is_enabled' => false,
    ]);

    expect(Cache::has("tenant_feature_{$this->tenant->id}_audit_log"))->toBeFalse();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/features')->assertStatus(401);
});

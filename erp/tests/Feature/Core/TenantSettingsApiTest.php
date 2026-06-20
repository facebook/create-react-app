<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Core\Models\TenantSetting;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Settings Co', 'slug' => 'settings-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can get all settings (all null by default)', function () {
    $data = $this->withToken($this->token)
        ->getJson('/api/v1/settings')
        ->assertStatus(200)
        ->json('data');

    expect($data)->toHaveKey('company_name');
    expect($data['company_name'])->toBeNull();
});

test('can update multiple settings at once', function () {
    $this->withToken($this->token)
        ->putJson('/api/v1/settings', [
            'company_name'  => 'Acme Corp',
            'currency'      => 'USD',
            'invoice_prefix' => 'INV-',
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.updated', 3);

    expect(TenantSetting::getValue($this->tenant->id, 'company_name'))->toBe('Acme Corp');
    expect(TenantSetting::getValue($this->tenant->id, 'currency'))->toBe('USD');
});

test('can get a single setting by key', function () {
    TenantSetting::setValue($this->tenant->id, 'invoice_prefix', 'INV-');

    $this->withToken($this->token)
        ->getJson('/api/v1/settings/invoice_prefix')
        ->assertStatus(200)
        ->assertJsonPath('data.key', 'invoice_prefix')
        ->assertJsonPath('data.value', 'INV-');
});

test('returns 404 for unknown setting key', function () {
    $this->withToken($this->token)
        ->getJson('/api/v1/settings/unknown_key_xyz')
        ->assertStatus(404);
});

test('can set a single setting', function () {
    $this->withToken($this->token)
        ->putJson('/api/v1/settings/company_name', ['value' => 'New Company'])
        ->assertStatus(200)
        ->assertJsonPath('data.key', 'company_name')
        ->assertJsonPath('data.value', 'New Company');

    expect(TenantSetting::getValue($this->tenant->id, 'company_name'))->toBe('New Company');
});

test('settings are tenant-isolated', function () {
    $otherTenant = Tenant::create(['name' => 'Other', 'slug' => 'other-set-' . uniqid()]);
    TenantSetting::setValue($otherTenant->id, 'company_name', 'Other Corp');

    $data = $this->withToken($this->token)
        ->getJson('/api/v1/settings')
        ->assertStatus(200)
        ->json('data');

    expect($data['company_name'])->toBeNull();
});

test('validates integer setting type', function () {
    $this->withToken($this->token)
        ->putJson('/api/v1/settings', [
            'invoice_next_number' => 'not-a-number',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['invoice_next_number']);
});

test('can get settings schema', function () {
    $schema = $this->withToken($this->token)
        ->getJson('/api/v1/settings/schema')
        ->assertStatus(200)
        ->json('data');

    expect($schema)->toHaveKey('company_name');
    expect($schema)->toHaveKey('currency');
    expect($schema)->toHaveKey('invoice_prefix');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/settings')->assertStatus(401);
});

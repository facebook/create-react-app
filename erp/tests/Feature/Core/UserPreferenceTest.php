<?php

use App\Models\User;
use App\Models\UserPreference;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Pref Co', 'slug' => 'pref-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('staff');
    $this->token  = $this->user->createToken('test')->plainTextToken;
});

test('can get user preferences with defaults', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/preferences');
    $response->assertStatus(200);
    $prefs = $response->json('data');
    expect($prefs)->toHaveKey('timezone');
    expect($prefs['timezone'])->toBe('UTC');
    expect($prefs)->toHaveKey('language');
    expect($prefs)->toHaveKey('items_per_page');
});

test('can update user preferences', function () {
    $response = $this->withToken($this->token)->putJson('/api/v1/preferences', [
        'preferences' => [
            'timezone'    => 'America/New_York',
            'language'    => 'fr',
            'compact_mode' => 'true',
        ],
    ]);

    $response->assertStatus(200);
    $prefs = $response->json('data.preferences');
    expect($prefs['timezone'])->toBe('America/New_York');
    expect($prefs['language'])->toBe('fr');
    expect($prefs['compact_mode'])->toBe('true');
});

test('unknown preference keys are silently ignored', function () {
    $response = $this->withToken($this->token)->putJson('/api/v1/preferences', [
        'preferences' => [
            'timezone'        => 'Asia/Tokyo',
            'unknown_setting' => 'value',
        ],
    ]);

    $response->assertStatus(200);
    expect($response->json('data.updated'))->toHaveKey('timezone');
    expect($response->json('data.updated'))->not->toHaveKey('unknown_setting');
});

test('can reset preferences to defaults', function () {
    UserPreference::setForUser($this->user->id, 'timezone', 'Asia/Tokyo');
    UserPreference::setForUser($this->user->id, 'language', 'de');

    $response = $this->withToken($this->token)->deleteJson('/api/v1/preferences');
    $response->assertStatus(200);
    $defaults = $response->json('data');
    expect($defaults['timezone'])->toBe('UTC');
    expect($defaults['language'])->toBe('en');
});

test('preferences are scoped per user_id in the model', function () {
    $otherUser = User::factory()->create(['tenant_id' => $this->tenant->id]);

    UserPreference::setForUser($this->user->id, 'timezone', 'Asia/Tokyo');
    UserPreference::setForUser($otherUser->id, 'timezone', 'Europe/London');

    $userPrefs  = UserPreference::getAllForUser($this->user->id);
    $otherPrefs = UserPreference::getAllForUser($otherUser->id);

    expect($userPrefs['timezone'])->toBe('Asia/Tokyo');
    expect($otherPrefs['timezone'])->toBe('Europe/London');
    expect($userPrefs['timezone'])->not->toBe($otherPrefs['timezone']);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/preferences')->assertStatus(401);
});

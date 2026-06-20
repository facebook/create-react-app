<?php

use App\Models\User;
use App\Modules\Core\Models\AuditLog;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Activity Co', 'slug' => 'activity-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('activity feed returns paginated logs with enriched data', function () {
    $this->actingAs($this->user);
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Jane Doe', 'type' => 'customer']);

    $response = $this->withToken($this->token)->getJson('/api/v1/activity');
    $response->assertStatus(200);

    expect($response->json('data'))->not->toBeEmpty();
    $item = $response->json('data.0');
    expect($item)->toHaveKeys(['action', 'model_type', 'model_id', 'description', 'created_at']);
});

test('activity feed enriches description with model type', function () {
    $this->actingAs($this->user);
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Test Contact', 'type' => 'vendor']);

    $response = $this->withToken($this->token)->getJson('/api/v1/activity?module=Contact');
    $item     = $response->json('data.0');

    expect($item['description'])->toContain('Contact');
    expect($item['description'])->toContain('created');
});

test('activity feed can filter by action', function () {
    $this->actingAs($this->user);
    $contact = Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Filterable', 'type' => 'customer']);
    $contact->update(['name' => 'Updated Filterable']);

    $response = $this->withToken($this->token)->getJson('/api/v1/activity?action=created');
    $response->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['action'])->toBe('created');
    }
});

test('activity feed can filter by module type', function () {
    $this->actingAs($this->user);
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Module Test', 'type' => 'customer']);

    $response = $this->withToken($this->token)->getJson('/api/v1/activity?module=Contact');
    $response->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['model_type'])->toBe('Contact');
    }
});

test('activity stats returns summary data', function () {
    $this->actingAs($this->user);
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Stats Test', 'type' => 'customer']);

    $response = $this->withToken($this->token)->getJson('/api/v1/activity/stats');
    $response->assertStatus(200);

    $data = $response->json('data');
    expect($data)->toHaveKeys(['total_events', 'recent_7_days', 'by_action', 'most_active_users']);
    expect($data['total_events'])->toBeGreaterThan(0);
});

test('activity feed does not expose other tenant data', function () {
    $otherTenant = Tenant::create(['name' => 'Other Co', 'slug' => 'other-co-' . uniqid()]);
    $otherUser   = User::factory()->create(['tenant_id' => $otherTenant->id]);

    app()->instance('tenant', $otherTenant);
    $this->actingAs($otherUser);
    Contact::create(['tenant_id' => $otherTenant->id, 'name' => 'Other Contact', 'type' => 'customer']);

    app()->instance('tenant', $this->tenant);
    $response = $this->withToken($this->token)->getJson('/api/v1/activity');
    $response->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['model_type'])->not->toBeNull();
    }
});

test('activity feed requires authentication', function () {
    $this->getJson('/api/v1/activity')->assertStatus(401);
    $this->getJson('/api/v1/activity/stats')->assertStatus(401);
});

<?php

use App\Models\User;
use App\Models\Webhook;
use App\Models\WebhookDelivery;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Webhook API Co', 'slug' => 'webhook-api-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can list webhooks via api', function () {
    Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Invoice Hook',
        'url'       => 'https://example.com/hook',
        'events'    => ['invoice.created'],
        'secret'    => 'secret123',
    ]);

    $this->withToken($this->token)
        ->getJson('/api/v1/webhooks')
        ->assertStatus(200)
        ->assertJsonPath('data.0.name', 'Invoice Hook');
});

test('can create a webhook', function () {
    $response = $this->withToken($this->token)
        ->postJson('/api/v1/webhooks', [
            'name'   => 'Payment Hook',
            'url'    => 'https://example.com/payment',
            'events' => ['payment.received', 'invoice.paid'],
        ]);

    $response->assertStatus(201);
    expect(Webhook::where('name', 'Payment Hook')->exists())->toBeTrue();

    $hook = Webhook::where('name', 'Payment Hook')->first();
    expect($hook->secret)->not->toBeNull();
});

test('store validates url format', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/webhooks', [
            'name'   => 'Bad URL',
            'url'    => 'not-a-url',
            'events' => ['invoice.created'],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['url']);
});

test('store validates known events', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/webhooks', [
            'name'   => 'Unknown Event',
            'url'    => 'https://example.com/hook',
            'events' => ['unknown.event'],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['events.0']);
});

test('can update a webhook', function () {
    $hook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Original',
        'url'       => 'https://example.com/orig',
        'events'    => ['invoice.created'],
        'secret'    => 'abc',
    ]);

    $this->withToken($this->token)
        ->putJson("/api/v1/webhooks/{$hook->id}", ['is_active' => false])
        ->assertStatus(200)
        ->assertJsonPath('data.is_active', false);
});

test('can delete a webhook', function () {
    $hook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Delete Me',
        'url'       => 'https://example.com/del',
        'events'    => ['invoice.created'],
        'secret'    => 'abc',
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/webhooks/{$hook->id}")
        ->assertStatus(200);

    expect(Webhook::find($hook->id))->toBeNull();
});

test('deliveries endpoint returns delivery log', function () {
    $hook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Hook With Deliveries',
        'url'       => 'https://example.com/del',
        'events'    => ['invoice.created'],
        'secret'    => 'abc',
    ]);

    WebhookDelivery::create([
        'webhook_id'      => $hook->id,
        'event'           => 'invoice.created',
        'payload'         => ['id' => 1],
        'response_status' => 200,
        'delivered_at'    => now(),
        'attempts'        => 1,
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/webhooks/{$hook->id}/deliveries")
        ->assertStatus(200)
        ->assertJsonPath('data.0.event', 'invoice.created');
});

test('rotate secret generates new secret', function () {
    $hook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Secret Hook',
        'url'       => 'https://example.com/secret',
        'events'    => ['invoice.created'],
        'secret'    => 'original-secret',
    ]);

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/webhooks/{$hook->id}/rotate-secret")
        ->assertStatus(200);

    $newSecret = $response->json('data.secret');
    expect($newSecret)->not->toBe('original-secret');
    expect(strlen($newSecret))->toBeGreaterThanOrEqual(32);
});

test('events endpoint lists supported events', function () {
    $this->withToken($this->token)
        ->getJson('/api/v1/webhooks/events')
        ->assertStatus(200);

    $events = $this->withToken($this->token)->getJson('/api/v1/webhooks/events')->json('data');
    expect($events)->toContain('invoice.created');
    expect($events)->toContain('payment.received');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/webhooks')->assertStatus(401);
});

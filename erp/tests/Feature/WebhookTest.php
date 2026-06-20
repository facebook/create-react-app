<?php

use App\Models\User;
use App\Models\Webhook;
use App\Models\WebhookDelivery;
use App\Modules\Core\Models\Tenant;
use App\Services\WebhookService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Hook Co', 'slug' => 'hook-co-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('webhooks index renders', function () {
    $this->actingAs($this->admin)
        ->get('/settings/webhooks')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Settings/Webhooks/Index')
            ->has('webhooks')
        );
});

test('webhook create page renders', function () {
    $this->actingAs($this->admin)
        ->get('/settings/webhooks/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Settings/Webhooks/Create'));
});

test('webhook can be stored', function () {
    $this->actingAs($this->admin)
        ->post('/settings/webhooks', [
            'name'      => 'Order Notifications',
            'url'       => 'https://example.com/webhook',
            'events'    => ['order.created', 'invoice.paid'],
            'secret'    => 'mysecret',
            'is_active' => true,
        ])
        ->assertRedirect('/settings/webhooks');

    expect(Webhook::withoutGlobalScopes()->where('name', 'Order Notifications')->exists())->toBeTrue();
    $wh = Webhook::withoutGlobalScopes()->where('name', 'Order Notifications')->first();
    expect($wh->events)->toContain('order.created');
    expect($wh->events)->toContain('invoice.paid');
});

test('webhook store validates required fields', function () {
    $this->actingAs($this->admin)
        ->post('/settings/webhooks', ['name' => ''])
        ->assertSessionHasErrors(['name', 'url']);
});

test('webhook edit page renders', function () {
    $webhook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Hook',
        'url'       => 'https://example.com/hook',
        'events'    => ['order.created'],
        'is_active' => true,
    ]);

    $this->actingAs($this->admin)
        ->get("/settings/webhooks/{$webhook->id}/edit")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Settings/Webhooks/Edit'));
});

test('webhook can be updated', function () {
    $webhook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Old Name',
        'url'       => 'https://example.com/old',
        'events'    => [],
        'is_active' => true,
    ]);

    $this->actingAs($this->admin)
        ->put("/settings/webhooks/{$webhook->id}", [
            'name'      => 'New Name',
            'url'       => 'https://example.com/new',
            'events'    => ['lead.won'],
            'is_active' => true,
        ])
        ->assertRedirect('/settings/webhooks');

    $webhook->refresh();
    expect($webhook->name)->toBe('New Name');
    expect($webhook->events)->toContain('lead.won');
});

test('webhook can be deleted', function () {
    $webhook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Delete Me',
        'url'       => 'https://example.com/hook',
        'events'    => [],
        'is_active' => true,
    ]);

    $this->actingAs($this->admin)
        ->delete("/settings/webhooks/{$webhook->id}")
        ->assertRedirect('/settings/webhooks');

    expect(Webhook::withoutGlobalScopes()->find($webhook->id))->toBeNull();
});

test('subscribesTo returns correct boolean', function () {
    $webhook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Subscribe Test',
        'url'       => 'https://example.com/hook',
        'events'    => ['order.created', 'invoice.paid'],
        'is_active' => true,
    ]);

    expect($webhook->subscribesTo('order.created'))->toBeTrue();
    expect($webhook->subscribesTo('invoice.paid'))->toBeTrue();
    expect($webhook->subscribesTo('lead.won'))->toBeFalse();
    expect($webhook->subscribesTo('nonexistent'))->toBeFalse();
});

test('webhook delivery is created on test ping', function () {
    Http::fake(['https://example.com/*' => Http::response('ok', 200)]);

    $webhook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Ping Test',
        'url'       => 'https://example.com/hook',
        'events'    => [],
        'is_active' => true,
    ]);

    $this->actingAs($this->admin)
        ->post("/settings/webhooks/{$webhook->id}/test")
        ->assertRedirect();

    expect(WebhookDelivery::where('webhook_id', $webhook->id)->exists())->toBeTrue();
    $delivery = WebhookDelivery::where('webhook_id', $webhook->id)->first();
    expect($delivery->event)->toBe('ping');
    expect($delivery->response_status)->toBe(200);
});

test('deliveries page renders', function () {
    $webhook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Delivery Test',
        'url'       => 'https://example.com/hook',
        'events'    => [],
        'is_active' => true,
    ]);

    $this->actingAs($this->admin)
        ->get("/settings/webhooks/{$webhook->id}/deliveries")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Settings/Webhooks/Deliveries')
            ->has('webhook')
            ->has('deliveries')
        );
});

test('HMAC signature is generated correctly', function () {
    Http::fake(['https://example.com/*' => Http::response('ok', 200)]);

    $webhook = Webhook::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'HMAC Test',
        'url'       => 'https://example.com/hook',
        'events'    => [],
        'secret'    => 'test-secret',
        'is_active' => true,
    ]);

    $payload = ['event' => 'order.created', 'data' => 'test'];
    WebhookService::send($webhook, 'order.created', $payload);

    Http::assertSent(function ($request) use ($payload) {
        $expectedSig = 'sha256=' . hash_hmac('sha256', json_encode($payload), 'test-secret');
        return $request->hasHeader('X-Webhook-Signature', $expectedSig);
    });
});

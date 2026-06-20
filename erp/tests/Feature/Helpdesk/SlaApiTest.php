<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Helpdesk\Models\HelpdeskSlaPolicy;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SLA Co', 'slug' => 'sla-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeSlaTicket(array $attrs = []): HelpdeskTicket
{
    return HelpdeskTicket::create([
        'tenant_id'    => test()->tenant->id,
        'subject'      => 'Test Issue ' . uniqid(),
        'description'  => 'Problem description',
        'status'       => 'open',
        'priority'     => 'medium',
        'submitted_by' => test()->user->id,
        ...$attrs,
    ]);
}

test('can create an SLA policy', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/sla/policies', [
            'name'             => 'High Priority SLA',
            'priority'         => 'high',
            'response_hours'   => 2,
            'resolution_hours' => 8,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.response_hours', 2)
        ->assertJsonPath('data.resolution_hours', 8);
});

test('can list SLA policies', function () {
    HelpdeskSlaPolicy::create([
        'tenant_id'        => $this->tenant->id,
        'name'             => 'Standard SLA',
        'priority'         => 'medium',
        'response_hours'   => 4,
        'resolution_hours' => 24,
        'is_active'        => true,
    ]);

    $this->withToken($this->token)
        ->getJson('/api/v1/sla/policies')
        ->assertStatus(200)
        ->assertJsonStructure(['data']);
});

test('validates priority values', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/sla/policies', [
            'name'             => 'Bad SLA',
            'priority'         => 'critical',
            'response_hours'   => 1,
            'resolution_hours' => 4,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['priority']);
});

test('can update an SLA policy', function () {
    $policy = HelpdeskSlaPolicy::create([
        'tenant_id'        => $this->tenant->id,
        'name'             => 'Old SLA',
        'priority'         => 'low',
        'response_hours'   => 24,
        'resolution_hours' => 72,
        'is_active'        => true,
    ]);

    $this->withToken($this->token)
        ->putJson("/api/v1/sla/policies/{$policy->id}", ['response_hours' => 12])
        ->assertStatus(200)
        ->assertJsonPath('data.response_hours', 12);
});

test('can delete an SLA policy', function () {
    $policy = HelpdeskSlaPolicy::create([
        'tenant_id'        => $this->tenant->id,
        'name'             => 'Delete Me',
        'priority'         => 'low',
        'response_hours'   => 48,
        'resolution_hours' => 96,
        'is_active'        => true,
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/sla/policies/{$policy->id}")
        ->assertStatus(200);

    expect(HelpdeskSlaPolicy::find($policy->id))->toBeNull();
});

test('dashboard returns open ticket counts', function () {
    makeSlaTicket(['status' => 'open', 'priority' => 'high']);
    makeSlaTicket(['status' => 'open', 'priority' => 'medium']);
    makeSlaTicket(['status' => 'resolved']);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/sla/dashboard')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['open_tickets', 'breached_count', 'breach_rate', 'by_priority', 'overdue_tickets']]);

    expect($response->json('data.open_tickets'))->toBe(2);
});

test('dashboard identifies breached tickets', function () {
    makeSlaTicket([
        'status'       => 'open',
        'sla_deadline' => now()->subHour(),
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/sla/dashboard')
        ->assertStatus(200);

    expect($response->json('data.breached_count'))->toBeGreaterThanOrEqual(1);
});

test('at-risk endpoint shows tickets expiring soon', function () {
    makeSlaTicket([
        'status'       => 'open',
        'sla_deadline' => now()->addMinutes(60),
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/sla/at-risk?within_minutes=120')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['within_minutes', 'count', 'tickets']]);

    expect($response->json('data.count'))->toBeGreaterThanOrEqual(1);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/sla/policies')->assertStatus(401);
    $this->getJson('/api/v1/sla/dashboard')->assertStatus(401);
});

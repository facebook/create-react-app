<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\CRM\Models\CrmLead;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'API Co', 'slug' => 'api-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('list leads returns paginated data', function () {
    CrmLead::create([
        'tenant_id'  => $this->tenant->id,
        'title'      => 'Test Lead',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/crm/leads');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'success',
                 'data',
                 'meta' => ['total', 'per_page', 'current_page', 'last_page'],
             ])
             ->assertJson(['success' => true]);
});

test('unauthorized requests rejected from leads list', function () {
    $this->getJson('/api/v1/crm/leads')->assertStatus(401);
});

test('create lead', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/crm/leads', [
        'title'        => 'New Lead',
        'contact_name' => 'John Doe',
        'email'        => 'john@example.com',
    ]);

    $response->assertStatus(201)
             ->assertJson(['success' => true])
             ->assertJsonPath('data.title', 'New Lead');

    $this->assertDatabaseHas('crm_leads', ['title' => 'New Lead']);
});

test('get single lead', function () {
    $lead = CrmLead::create([
        'tenant_id'  => $this->tenant->id,
        'title'      => 'Single Lead',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson("/api/v1/crm/leads/{$lead->id}");

    $response->assertStatus(200)
             ->assertJsonPath('data.id', $lead->id)
             ->assertJsonPath('data.title', 'Single Lead');
});

test('mark lead as won', function () {
    $lead = CrmLead::create([
        'tenant_id'  => $this->tenant->id,
        'title'      => 'Won Lead',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->postJson("/api/v1/crm/leads/{$lead->id}/won");

    $response->assertStatus(200)
             ->assertJson(['success' => true])
             ->assertJsonPath('data.status', 'won');

    $this->assertDatabaseHas('crm_leads', ['id' => $lead->id, 'status' => 'won']);
});

test('mark lead as lost with reason', function () {
    $lead = CrmLead::create([
        'tenant_id'  => $this->tenant->id,
        'title'      => 'Lost Lead',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->postJson("/api/v1/crm/leads/{$lead->id}/lost", [
        'reason' => 'Budget constraints',
    ]);

    $response->assertStatus(200)
             ->assertJson(['success' => true])
             ->assertJsonPath('data.status', 'lost');

    $this->assertDatabaseHas('crm_leads', [
        'id'          => $lead->id,
        'status'      => 'lost',
        'lost_reason' => 'Budget constraints',
    ]);
});

test('update lead', function () {
    $lead = CrmLead::create([
        'tenant_id'  => $this->tenant->id,
        'title'      => 'Update Lead',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->putJson("/api/v1/crm/leads/{$lead->id}", [
        'title' => 'Updated Lead Title',
    ]);

    $response->assertStatus(200)
             ->assertJsonPath('data.title', 'Updated Lead Title');
});

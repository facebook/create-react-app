<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'API Co', 'slug' => 'api-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('list tickets returns paginated data', function () {
    HelpdeskTicket::create([
        'tenant_id'  => $this->tenant->id,
        'subject'    => 'Test Ticket',
        'status'     => 'open',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/helpdesk/tickets');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'success',
                 'data',
                 'meta' => ['total', 'per_page', 'current_page', 'last_page'],
             ])
             ->assertJson(['success' => true]);
});

test('unauthorized requests rejected from tickets', function () {
    $this->getJson('/api/v1/helpdesk/tickets')->assertStatus(401);
});

test('create ticket', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/helpdesk/tickets', [
        'subject'     => 'New Support Ticket',
        'description' => 'I need help with something',
        'priority'    => 'medium',
    ]);

    $response->assertStatus(201)
             ->assertJson(['success' => true])
             ->assertJsonPath('data.subject', 'New Support Ticket');

    $this->assertDatabaseHas('helpdesk_tickets', ['subject' => 'New Support Ticket']);
});

test('get single ticket with messages', function () {
    $ticket = HelpdeskTicket::create([
        'tenant_id'  => $this->tenant->id,
        'subject'    => 'Single Ticket',
        'status'     => 'open',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson("/api/v1/helpdesk/tickets/{$ticket->id}");

    $response->assertStatus(200)
             ->assertJsonPath('data.id', $ticket->id)
             ->assertJsonPath('data.subject', 'Single Ticket');
});

test('reply to ticket', function () {
    $ticket = HelpdeskTicket::create([
        'tenant_id'  => $this->tenant->id,
        'subject'    => 'Reply Ticket',
        'status'     => 'open',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->postJson("/api/v1/helpdesk/tickets/{$ticket->id}/reply", [
        'body' => 'Here is my response to the ticket.',
    ]);

    $response->assertStatus(201)
             ->assertJson(['success' => true])
             ->assertJsonPath('data.body', 'Here is my response to the ticket.');

    $this->assertDatabaseHas('helpdesk_messages', [
        'ticket_id' => $ticket->id,
        'body'      => 'Here is my response to the ticket.',
    ]);
});

test('resolve ticket changes status', function () {
    $ticket = HelpdeskTicket::create([
        'tenant_id'  => $this->tenant->id,
        'subject'    => 'Resolve Ticket',
        'status'     => 'open',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->postJson("/api/v1/helpdesk/tickets/{$ticket->id}/resolve");

    $response->assertStatus(200)
             ->assertJson(['success' => true])
             ->assertJsonPath('data.status', 'resolved');

    $this->assertDatabaseHas('helpdesk_tickets', ['id' => $ticket->id, 'status' => 'resolved']);
});

test('update ticket', function () {
    $ticket = HelpdeskTicket::create([
        'tenant_id'  => $this->tenant->id,
        'subject'    => 'Update Ticket',
        'status'     => 'open',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->putJson("/api/v1/helpdesk/tickets/{$ticket->id}", [
        'priority' => 'high',
    ]);

    $response->assertStatus(200)
             ->assertJsonPath('data.priority', 'high');
});

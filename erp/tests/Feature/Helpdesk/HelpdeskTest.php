<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Helpdesk\Models\HelpdeskMessage;
use App\Modules\Helpdesk\Models\HelpdeskSlaPolicy;
use App\Modules\Helpdesk\Models\HelpdeskTeam;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Helpdesk Corp', 'slug' => 'helpdesk-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeTicket(array $attrs = []): HelpdeskTicket
{
    $ticket = HelpdeskTicket::create(array_merge([
        'tenant_id'  => test()->tenant->id,
        'subject'    => 'Test Ticket ' . uniqid(),
        'type'       => 'issue',
        'priority'   => 'medium',
        'status'     => 'open',
        'created_by' => test()->admin->id,
    ], $attrs));

    if (! $ticket->ticket_number) {
        $ticket->ticket_number = $ticket->generateTicketNumber();
        $ticket->saveQuietly();
    }

    return $ticket;
}

function makeTeam(array $attrs = []): HelpdeskTeam
{
    return HelpdeskTeam::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Team ' . uniqid(),
        'is_active' => true,
    ], $attrs));
}

// ---- Dashboard ----

it('renders helpdesk dashboard', function () {
    $this->get('/helpdesk/dashboard')->assertOk();
});

// ---- Tickets ----

it('renders tickets index', function () {
    $this->get('/helpdesk/tickets')->assertOk();
});

it('renders tickets create page', function () {
    $this->get('/helpdesk/tickets/create')->assertOk();
});

it('stores a ticket and generates ticket number', function () {
    $this->post('/helpdesk/tickets', [
        'subject'  => 'Login broken',
        'type'     => 'issue',
        'priority' => 'high',
    ])->assertRedirect();

    $ticket = HelpdeskTicket::where('subject', 'Login broken')->first();
    expect($ticket)->not->toBeNull();
    expect($ticket->ticket_number)->toMatch('/^HD-\d{4}-\d{5}$/');
});

it('shows a ticket', function () {
    $ticket = makeTicket();
    $this->get("/helpdesk/tickets/{$ticket->id}")->assertOk();
});

it('renders ticket edit page', function () {
    $ticket = makeTicket();
    $this->get("/helpdesk/tickets/{$ticket->id}/edit")->assertOk();
});

it('updates a ticket', function () {
    $ticket = makeTicket();
    $this->put("/helpdesk/tickets/{$ticket->id}", [
        'subject'  => 'Updated Subject',
        'type'     => 'question',
        'priority' => 'low',
        'status'   => 'in_progress',
    ])->assertRedirect();

    expect($ticket->fresh()->subject)->toBe('Updated Subject');
    expect($ticket->fresh()->status)->toBe('in_progress');
});

it('soft-deletes a ticket', function () {
    $ticket = makeTicket();
    $this->delete("/helpdesk/tickets/{$ticket->id}")->assertRedirect();

    expect(HelpdeskTicket::find($ticket->id))->toBeNull();
    expect(HelpdeskTicket::withTrashed()->find($ticket->id))->not->toBeNull();
});

// ---- Ticket Actions ----

it('resolves a ticket', function () {
    $ticket = makeTicket(['status' => 'open']);
    $this->post("/helpdesk/tickets/{$ticket->id}/resolve")->assertRedirect();

    expect($ticket->fresh()->status)->toBe('resolved');
    expect($ticket->fresh()->resolved_at)->not->toBeNull();
});

it('closes a ticket', function () {
    $ticket = makeTicket(['status' => 'open']);
    $this->post("/helpdesk/tickets/{$ticket->id}/close")->assertRedirect();

    expect($ticket->fresh()->status)->toBe('closed');
    expect($ticket->fresh()->closed_at)->not->toBeNull();
});

it('reopens a resolved ticket', function () {
    $ticket = makeTicket(['status' => 'resolved', 'resolved_at' => now()]);
    $this->post("/helpdesk/tickets/{$ticket->id}/reopen")->assertRedirect();

    expect($ticket->fresh()->status)->toBe('open');
    expect($ticket->fresh()->resolved_at)->toBeNull();
});

// ---- Replies & Messages ----

it('creates a reply message and sets first_response_at', function () {
    $ticket = makeTicket(['first_response_at' => null]);
    $this->post("/helpdesk/tickets/{$ticket->id}/reply", [
        'body'        => 'We are looking into this.',
        'is_internal' => false,
    ])->assertRedirect();

    expect(HelpdeskMessage::where('ticket_id', $ticket->id)->where('body', 'We are looking into this.')->exists())->toBeTrue();
    expect($ticket->fresh()->first_response_at)->not->toBeNull();
});

it('stores an internal note', function () {
    $ticket = makeTicket();
    $this->post("/helpdesk/tickets/{$ticket->id}/reply", [
        'body'        => 'Internal: check logs',
        'is_internal' => true,
    ])->assertRedirect();

    $message = HelpdeskMessage::where('ticket_id', $ticket->id)->first();
    expect($message->is_internal)->toBeTrue();
});

// ---- Teams ----

it('renders teams index', function () {
    $this->get('/helpdesk/teams')->assertOk();
});

it('stores a team', function () {
    $this->post('/helpdesk/teams', [
        'name'      => 'Technical Support',
        'is_active' => true,
    ])->assertRedirect();

    expect(HelpdeskTeam::where('name', 'Technical Support')->exists())->toBeTrue();
});

it('updates a team', function () {
    $team = makeTeam();
    $this->put("/helpdesk/teams/{$team->id}", [
        'name'      => 'Updated Team',
        'is_active' => false,
    ])->assertRedirect();

    expect($team->fresh()->name)->toBe('Updated Team');
    expect($team->fresh()->is_active)->toBeFalse();
});

it('deletes a team', function () {
    $team = makeTeam();
    $this->delete("/helpdesk/teams/{$team->id}")->assertRedirect();

    expect(HelpdeskTeam::find($team->id))->toBeNull();
});

// ---- Filters & Special Cases ----

it('filters tickets by status', function () {
    makeTicket(['status' => 'open']);
    makeTicket(['status' => 'resolved', 'resolved_at' => now()]);

    $response = $this->get('/helpdesk/tickets?status=open');
    $response->assertOk();

    $tickets = $response->original->getData()['page']['props']['tickets']['data'];
    foreach ($tickets as $ticket) {
        expect($ticket['status'])->toBe('open');
    }
});

it('counts overdue tickets on dashboard', function () {
    // Create an overdue ticket
    makeTicket([
        'sla_deadline' => now()->subHour(),
        'status'       => 'open',
    ]);

    $response = $this->get('/helpdesk/dashboard');
    $response->assertOk();

    $stats = $response->original->getData()['page']['props']['stats'];
    expect($stats['overdueCount'])->toBeGreaterThanOrEqual(1);
});

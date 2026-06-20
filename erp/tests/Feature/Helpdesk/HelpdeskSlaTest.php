<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Helpdesk\Models\HelpdeskSlaPolicy;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use App\Modules\Helpdesk\Models\TicketEscalation;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SLA Co', 'slug' => 'sla-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeHelpdeskTicket(array $overrides = []): HelpdeskTicket
{
    $ticket = HelpdeskTicket::create(array_merge([
        'tenant_id'     => app('tenant')->id,
        'ticket_number' => 'HD-TEST-001',
        'subject'       => 'Test Issue',
        'description'   => 'Something is broken',
        'priority'      => 'medium',
        'status'        => 'open',
        'created_by'    => auth()->id(),
    ], $overrides));
    $ticket->ticket_number = $ticket->generateTicketNumber();
    $ticket->save();
    return $ticket;
}

test('sla policies page renders', function () {
    $response = $this->get('/helpdesk/sla/policies');
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Helpdesk/Sla/Policies'));
});

test('can create sla policy', function () {
    $response = $this->post('/helpdesk/sla/policies', [
        'name'             => 'Urgent SLA',
        'priority'         => 'urgent',
        'response_hours'   => 1,
        'resolution_hours' => 4,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('helpdesk_sla_policies', ['name' => 'Urgent SLA', 'priority' => 'urgent']);
});

test('sla policy stores with correct hours', function () {
    $this->post('/helpdesk/sla/policies', [
        'name'             => 'High Priority SLA',
        'priority'         => 'high',
        'response_hours'   => 4,
        'resolution_hours' => 24,
    ]);

    $policy = HelpdeskSlaPolicy::where('name', 'High Priority SLA')->first();
    expect($policy)->not->toBeNull();
    expect((int) $policy->response_hours)->toBe(4);
    expect((int) $policy->resolution_hours)->toBe(24);
});

test('escalations page renders', function () {
    $response = $this->get('/helpdesk/sla/escalations');
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Helpdesk/Sla/Escalations'));
});

test('can escalate a ticket manually', function () {
    $ticket = makeHelpdeskTicket();

    $response = $this->post("/helpdesk/tickets/{$ticket->id}/escalate", [
        'escalation_type' => 'resolution_breach',
        'notes'           => 'Customer is waiting urgently',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('helpdesk_ticket_escalations', [
        'ticket_id'       => $ticket->id,
        'escalation_type' => 'resolution_breach',
    ]);
});

test('check breaches creates escalation for overdue ticket', function () {
    $ticket = makeHelpdeskTicket([
        'sla_deadline' => now()->subHours(2),
        'status'       => 'open',
    ]);

    $this->post('/helpdesk/sla/check-breaches');

    $this->assertDatabaseHas('helpdesk_ticket_escalations', [
        'ticket_id'       => $ticket->id,
        'escalation_type' => 'resolution_breach',
    ]);
});

test('check breaches does not duplicate escalations', function () {
    $ticket = makeHelpdeskTicket(['sla_deadline' => now()->subHours(2)]);

    $this->post('/helpdesk/sla/check-breaches');
    $this->post('/helpdesk/sla/check-breaches');

    $count = TicketEscalation::where('ticket_id', $ticket->id)->count();
    expect($count)->toBe(1);
});

test('can resolve an escalation', function () {
    $ticket     = makeHelpdeskTicket();
    $escalation = TicketEscalation::create([
        'tenant_id'       => $this->tenant->id,
        'ticket_id'       => $ticket->id,
        'escalation_type' => 'response_breach',
        'escalated_at'    => now(),
    ]);

    $this->post("/helpdesk/escalations/{$escalation->id}/resolve", ['notes' => 'Issue escalated to manager']);

    $escalation->refresh();
    expect($escalation->isResolved())->toBeTrue();
    expect($escalation->resolved_at)->not->toBeNull();
});

test('resolved tickets not escalated in breach check', function () {
    makeHelpdeskTicket([
        'sla_deadline' => now()->subHours(5),
        'status'       => 'resolved',
        'resolved_at'  => now()->subHours(1),
    ]);

    $this->post('/helpdesk/sla/check-breaches');

    expect(TicketEscalation::count())->toBe(0);
});

test('ticket is overdue when sla deadline passed', function () {
    $ticket = makeHelpdeskTicket(['sla_deadline' => now()->subMinutes(30)]);

    expect($ticket->is_overdue)->toBeTrue();
});

test('ticket escalation resolve sets notes', function () {
    $ticket     = makeHelpdeskTicket();
    $escalation = TicketEscalation::create([
        'tenant_id'       => $this->tenant->id,
        'ticket_id'       => $ticket->id,
        'escalation_type' => 'response_breach',
        'escalated_at'    => now(),
    ]);

    $this->post("/helpdesk/escalations/{$escalation->id}/resolve", ['notes' => 'Resolved by manager']);

    $escalation->refresh();
    expect($escalation->notes)->toBe('Resolved by manager');
});

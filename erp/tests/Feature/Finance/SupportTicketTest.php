<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\SupportTicket;
use App\Modules\Finance\Models\TicketComment;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Support Corp', 'slug' => 'support-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSupportTicket(string $status = 'open'): SupportTicket
{
    return SupportTicket::create([
        'tenant_id'   => test()->tenant->id,
        'reference'   => 'TKT-' . rand(1000, 9999),
        'subject'     => 'Test Issue',
        'description' => 'Something broke',
        'status'      => $status,
        'priority'    => 'normal',
        'created_by'  => test()->admin->id,
    ]);
}

it('admin can list support tickets', function () {
    $this->get('/finance/support-tickets')->assertStatus(200);
});

it('admin can create a support ticket', function () {
    $this->post('/finance/support-tickets', [
        'subject'     => 'Login not working',
        'description' => 'Cannot log in since morning',
        'priority'    => 'high',
    ])->assertRedirect();
    $ticket = SupportTicket::where('subject', 'Login not working')->first();
    expect($ticket)->not->toBeNull();
    expect($ticket->reference)->toStartWith('TKT-');
});

it('ticket store requires subject and description', function () {
    $this->postJson('/finance/support-tickets', ['subject' => '', 'description' => ''])
        ->assertStatus(422)->assertJsonValidationErrors(['subject', 'description']);
});

it('admin can view a ticket', function () {
    $ticket = makeSupportTicket();
    $this->get("/finance/support-tickets/{$ticket->id}")->assertStatus(200);
});

it('admin can resolve a ticket', function () {
    $ticket = makeSupportTicket();
    $this->post("/finance/support-tickets/{$ticket->id}/resolve")->assertRedirect();
    expect($ticket->fresh()->status)->toBe('resolved');
    expect($ticket->fresh()->resolved_at)->not->toBeNull();
});

it('admin can close a ticket', function () {
    $ticket = makeSupportTicket('resolved');
    $this->post("/finance/support-tickets/{$ticket->id}/close")->assertRedirect();
    expect($ticket->fresh()->status)->toBe('closed');
});

it('admin can reopen a closed ticket', function () {
    $ticket = makeSupportTicket('closed');
    $this->post("/finance/support-tickets/{$ticket->id}/reopen")->assertRedirect();
    expect($ticket->fresh()->status)->toBe('open');
});

it('admin can add a comment to a ticket', function () {
    $ticket = makeSupportTicket();
    $this->post("/finance/support-tickets/{$ticket->id}/comments", [
        'body'        => 'Investigating now',
        'is_internal' => false,
    ])->assertRedirect();
    expect($ticket->comments()->count())->toBe(1);
});

it('response_time_hours calculates from create to resolved', function () {
    $ticket = SupportTicket::create([
        'tenant_id'   => test()->tenant->id,
        'reference'   => 'TKT-TIME-001',
        'subject'     => 'Time Test',
        'description' => 'Test',
        'status'      => 'resolved',
        'priority'    => 'normal',
        'created_by'  => test()->admin->id,
        'resolved_at' => now(),
    ]);
    // Manually backdate created_at so the diff is 3 hours
    \Illuminate\Support\Facades\DB::table('support_tickets')
        ->where('id', $ticket->id)
        ->update(['created_at' => now()->subHours(3)]);
    $ticket = $ticket->fresh();
    expect($ticket->response_time_hours)->toBe(3.0);
});

it('staff cannot delete a support ticket', function () {
    $ticket = makeSupportTicket();
    $this->actingAs($this->staff)
        ->delete("/finance/support-tickets/{$ticket->id}")
        ->assertStatus(403);
});

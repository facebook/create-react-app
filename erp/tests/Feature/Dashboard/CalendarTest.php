<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Events\Models\Event;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Calendar Co', 'slug' => 'cal-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('calendar returns events within date range', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/calendar?from=2025-01-01&to=2025-12-31');
    $response->assertStatus(200);
    expect($response->json('data'))->toHaveKeys(['from', 'to', 'total', 'events']);
});

test('calendar includes pm tasks due in range', function () {
    $project = Project::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Test Project',
        'status'     => 'active',
        'start_date' => now()->subDays(10),
        'end_date'   => now()->addDays(10),
    ]);

    Task::create([
        'tenant_id'  => $this->tenant->id,
        'project_id' => $project->id,
        'title'      => 'Due Task',
        'status'     => 'open',
        'due_date'   => now()->addDays(5),
        'priority'   => 'high',
    ]);

    $from = now()->subDay()->toDateString();
    $to   = now()->addDays(10)->toDateString();

    $response = $this->withToken($this->token)->getJson("/api/v1/calendar?from={$from}&to={$to}&types[]=tasks");
    $response->assertStatus(200);

    $events = collect($response->json('data.events'));
    $task   = $events->firstWhere('type', 'task');
    expect($task)->not->toBeNull();
    expect($task['title'])->toBe('Due Task');
});

test('calendar includes events in range', function () {
    Event::create([
        'tenant_id'  => $this->tenant->id,
        'title'      => 'Company All-Hands',
        'starts_at'  => now()->addDays(3),
        'ends_at'    => now()->addDays(3)->addHours(2),
        'status'     => 'published',
        'max_attendees' => 100,
    ]);

    $from = now()->toDateString();
    $to   = now()->addDays(7)->toDateString();

    $response = $this->withToken($this->token)->getJson("/api/v1/calendar?from={$from}&to={$to}&types[]=events");
    $response->assertStatus(200);

    $events = collect($response->json('data.events'));
    $event  = $events->firstWhere('type', 'event');
    expect($event)->not->toBeNull();
    expect($event['title'])->toBe('Company All-Hands');
});

test('calendar includes invoice due dates', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Calendar Customer',
        'type'      => 'customer',
    ]);

    Invoice::create([
        'tenant_id'  => $this->tenant->id,
        'contact_id' => $contact->id,
        'number'     => 'CAL-001',
        'issue_date' => now(),
        'due_date'   => now()->addDays(5),
        'status'     => 'sent',
        'subtotal'   => 500,
        'tax'        => 0,
        'total'      => 500,
    ]);

    $from = now()->toDateString();
    $to   = now()->addDays(10)->toDateString();

    $response = $this->withToken($this->token)->getJson("/api/v1/calendar?from={$from}&to={$to}&types[]=invoices");
    $response->assertStatus(200);

    $events  = collect($response->json('data.events'));
    $invoice = $events->firstWhere('type', 'invoice_due');
    expect($invoice)->not->toBeNull();
    expect($invoice['title'])->toContain('CAL-001');
});

test('calendar can filter by type', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/calendar?types[]=tasks&from=2025-01-01&to=2025-12-31');
    $response->assertStatus(200);

    foreach ($response->json('data.events') as $event) {
        expect($event['type'])->toBe('task');
    }
});

test('calendar requires authentication', function () {
    $this->getJson('/api/v1/calendar')->assertStatus(401);
});

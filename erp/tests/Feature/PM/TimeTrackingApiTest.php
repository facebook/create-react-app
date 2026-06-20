<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use App\Modules\PM\Models\TimeEntry;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Time Track Co', 'slug' => 'time-track-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);

    $this->project = Project::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Test Project',
        'status'     => 'active',
        'created_by' => $this->user->id,
    ]);

    $this->task = Task::create([
        'tenant_id'  => $this->tenant->id,
        'project_id' => $this->project->id,
        'title'      => 'Test Task',
        'status'     => 'in_progress',
        'created_by' => $this->user->id,
    ]);
});

test('can list time entries', function () {
    TimeEntry::create([
        'tenant_id'  => $this->tenant->id,
        'task_id'    => $this->task->id,
        'user_id'    => $this->user->id,
        'hours'      => 2.5,
        'date'       => now()->toDateString(),
        'is_billable' => true,
        'created_by' => $this->user->id,
    ]);

    $this->withToken($this->token)
        ->getJson('/api/v1/time-entries')
        ->assertStatus(200);
});

test('can create a time entry', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/time-entries', [
            'task_id'    => $this->task->id,
            'hours'      => 3.0,
            'date'       => now()->toDateString(),
            'description' => 'Working on feature X',
        ])
        ->assertStatus(201);

    expect(TimeEntry::where('task_id', $this->task->id)->exists())->toBeTrue();
});

test('store validates hours range', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/time-entries', [
            'task_id' => $this->task->id,
            'hours'   => 25,
            'date'    => now()->toDateString(),
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['hours']);
});

test('can update a time entry', function () {
    $entry = TimeEntry::create([
        'tenant_id'  => $this->tenant->id,
        'task_id'    => $this->task->id,
        'user_id'    => $this->user->id,
        'hours'      => 1.0,
        'date'       => now()->toDateString(),
        'created_by' => $this->user->id,
    ]);

    $this->withToken($this->token)
        ->putJson("/api/v1/time-entries/{$entry->id}", ['hours' => 2.5])
        ->assertStatus(200)
        ->assertJsonPath('data.hours', 2.5);
});

test('can delete a time entry', function () {
    $entry = TimeEntry::create([
        'tenant_id'  => $this->tenant->id,
        'task_id'    => $this->task->id,
        'user_id'    => $this->user->id,
        'hours'      => 1.0,
        'date'       => now()->toDateString(),
        'created_by' => $this->user->id,
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/time-entries/{$entry->id}")
        ->assertStatus(200);

    expect(TimeEntry::find($entry->id))->toBeNull();
});

test('project time summary returns hours breakdown', function () {
    TimeEntry::create([
        'tenant_id'   => $this->tenant->id,
        'task_id'     => $this->task->id,
        'user_id'     => $this->user->id,
        'hours'       => 4.0,
        'date'        => now()->toDateString(),
        'is_billable' => true,
        'created_by'  => $this->user->id,
    ]);

    TimeEntry::create([
        'tenant_id'   => $this->tenant->id,
        'task_id'     => $this->task->id,
        'user_id'     => $this->user->id,
        'hours'       => 1.0,
        'date'        => now()->toDateString(),
        'is_billable' => false,
        'created_by'  => $this->user->id,
    ]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/projects/{$this->project->id}/time")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['project_id', 'total_hours', 'billable_hours', 'by_user']]);

    expect($response->json('data.total_hours'))->toBe(5);
    expect($response->json('data.billable_hours'))->toBe(4);
});

test('time list supports user filter', function () {
    $other = User::factory()->create(['tenant_id' => $this->tenant->id]);

    TimeEntry::create([
        'tenant_id'  => $this->tenant->id,
        'task_id'    => $this->task->id,
        'user_id'    => $other->id,
        'hours'      => 2.0,
        'date'       => now()->toDateString(),
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/time-entries?user_id={$this->user->id}")
        ->assertStatus(200);

    $entries = $response->json('data');
    $userIds = collect($entries)->pluck('user_id')->unique()->values();
    expect($userIds)->not->toContain($other->id);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/time-entries')->assertStatus(401);
});

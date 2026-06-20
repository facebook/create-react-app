<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\PM\Models\Milestone;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use App\Modules\PM\Models\TimeEntry;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PMCorp', 'slug' => 'pm-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

// ========================
// Helper functions
// ========================

function makePmProject(array $overrides = []): Project
{
    $tenantId = app('tenant')->id;
    return Project::create(array_merge([
        'tenant_id' => $tenantId,
        'name'      => 'Test Project ' . uniqid(),
        'status'    => 'active',
        'priority'  => 'medium',
    ], $overrides));
}

function makePmTask(Project $project, array $overrides = []): Task
{
    $tenantId = app('tenant')->id;
    return Task::create(array_merge([
        'tenant_id'  => $tenantId,
        'project_id' => $project->id,
        'title'      => 'Test Task ' . uniqid(),
        'status'     => 'todo',
        'priority'   => 'medium',
    ], $overrides));
}

function makePmMilestone(Project $project, array $overrides = []): Milestone
{
    $tenantId = app('tenant')->id;
    return Milestone::create(array_merge([
        'tenant_id'  => $tenantId,
        'project_id' => $project->id,
        'name'       => 'Test Milestone ' . uniqid(),
    ], $overrides));
}

// ========================
// Dashboard Tests
// ========================

it('pm dashboard renders', function () {
    $this->get('/pm/dashboard')->assertOk();
});

// ========================
// Projects CRUD
// ========================

it('can list projects', function () {
    makePmProject();
    $this->get('/pm/projects')->assertOk();
});

it('can view project create page', function () {
    $this->get('/pm/projects/create')->assertOk();
});

it('can store a project', function () {
    $this->post('/pm/projects', [
        'name'     => 'My New Project',
        'status'   => 'draft',
        'priority' => 'high',
    ])->assertRedirect();

    expect(Project::where('name', 'My New Project')->exists())->toBeTrue();
});

it('auto-generates project code on store', function () {
    $this->post('/pm/projects', [
        'name'     => 'Code Gen Project',
        'status'   => 'draft',
        'priority' => 'medium',
    ])->assertRedirect();

    $project = Project::where('name', 'Code Gen Project')->first();
    expect($project->code)->toStartWith('PM-');
});

it('can show a project', function () {
    $project = makePmProject();
    $this->get("/pm/projects/{$project->id}")->assertOk();
});

it('can view project edit page', function () {
    $project = makePmProject();
    $this->get("/pm/projects/{$project->id}/edit")->assertOk();
});

it('can update a project', function () {
    $project = makePmProject(['name' => 'Old Name']);

    $this->put("/pm/projects/{$project->id}", [
        'name'     => 'Updated Name',
        'status'   => 'active',
        'priority' => 'high',
    ])->assertRedirect();

    expect($project->fresh()->name)->toBe('Updated Name');
    expect($project->fresh()->status)->toBe('active');
});

it('can soft delete a project', function () {
    $project = makePmProject();

    $this->delete("/pm/projects/{$project->id}")->assertRedirect();

    expect(Project::withTrashed()->find($project->id)->deleted_at)->not->toBeNull();
});

// ========================
// Tasks CRUD
// ========================

it('can store a task on a project', function () {
    $project = makePmProject();

    $this->post("/pm/projects/{$project->id}/tasks", [
        'title'    => 'My Task',
        'status'   => 'todo',
        'priority' => 'medium',
    ])->assertRedirect();

    expect(Task::where('title', 'My Task')->where('project_id', $project->id)->exists())->toBeTrue();
});

it('can show a task', function () {
    $project = makePmProject();
    $task    = makePmTask($project);

    $this->get("/pm/projects/{$project->id}/tasks/{$task->id}")->assertOk();
});

it('can view task edit page', function () {
    $project = makePmProject();
    $task    = makePmTask($project);

    $this->get("/pm/projects/{$project->id}/tasks/{$task->id}/edit")->assertOk();
});

it('can update a task', function () {
    $project = makePmProject();
    $task    = makePmTask($project, ['title' => 'Old Title']);

    $this->put("/pm/projects/{$project->id}/tasks/{$task->id}", [
        'title'    => 'New Title',
        'status'   => 'in_progress',
        'priority' => 'high',
    ])->assertRedirect();

    expect($task->fresh()->title)->toBe('New Title');
    expect($task->fresh()->status)->toBe('in_progress');
});

it('can complete a task', function () {
    $project = makePmProject();
    $task    = makePmTask($project, ['status' => 'in_progress']);

    $this->post("/pm/projects/{$project->id}/tasks/{$task->id}/complete")->assertRedirect();

    expect($task->fresh()->status)->toBe('done');
});

it('can soft delete a task', function () {
    $project = makePmProject();
    $task    = makePmTask($project);

    $this->delete("/pm/projects/{$project->id}/tasks/{$task->id}")->assertRedirect();

    expect(Task::withTrashed()->find($task->id)->deleted_at)->not->toBeNull();
});

// ========================
// Milestones
// ========================

it('can store a milestone', function () {
    $project = makePmProject();

    $this->post("/pm/projects/{$project->id}/milestones", [
        'name' => 'Alpha Release',
    ])->assertRedirect();

    expect(Milestone::where('name', 'Alpha Release')->where('project_id', $project->id)->exists())->toBeTrue();
});

it('can complete a milestone', function () {
    $project   = makePmProject();
    $milestone = makePmMilestone($project);

    $this->post("/pm/projects/{$project->id}/milestones/{$milestone->id}/complete")->assertRedirect();

    expect($milestone->fresh()->is_completed)->toBeTrue();
    expect($milestone->fresh()->completed_at)->not->toBeNull();
});

it('can delete a milestone', function () {
    $project   = makePmProject();
    $milestone = makePmMilestone($project);

    $this->delete("/pm/projects/{$project->id}/milestones/{$milestone->id}")->assertRedirect();

    expect(Milestone::find($milestone->id))->toBeNull();
});

// ========================
// Time Entries
// ========================

it('can store a time entry on a task', function () {
    $project = makePmProject();
    $task    = makePmTask($project);

    $this->post("/pm/tasks/{$task->id}/time-entries", [
        'hours'       => 2.5,
        'date'        => '2026-06-01',
        'is_billable' => true,
    ])->assertRedirect();

    expect(TimeEntry::where('task_id', $task->id)->where('hours', 2.5)->exists())->toBeTrue();
});

it('can delete a time entry', function () {
    $project = makePmProject();
    $task    = makePmTask($project);

    $entry = TimeEntry::create([
        'tenant_id'  => $this->tenant->id,
        'task_id'    => $task->id,
        'user_id'    => $this->admin->id,
        'hours'      => 1.0,
        'date'       => '2026-06-01',
        'is_billable'=> true,
    ]);

    $this->delete("/pm/time-entries/{$entry->id}")->assertRedirect();

    expect(TimeEntry::find($entry->id))->toBeNull();
});

it('my time log page renders', function () {
    $this->get('/pm/time-entries')->assertOk();
});

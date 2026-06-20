<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\ProjectSprint;
use App\Modules\PM\Models\Task;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Sprint Corp', 'slug' => 'sprint-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

// ========================
// Helper functions
// ========================

function makePmSprintProject(array $overrides = []): Project
{
    return Project::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Sprint Project ' . uniqid(),
        'status'    => 'active',
        'priority'  => 'medium',
    ], $overrides));
}

function makePmSprintTask(Project $project, array $overrides = []): Task
{
    return Task::create(array_merge([
        'tenant_id'  => test()->tenant->id,
        'project_id' => $project->id,
        'title'      => 'Sprint Task ' . uniqid(),
        'status'     => 'todo',
        'priority'   => 'medium',
    ], $overrides));
}

function makePmSprint(Project $project, array $overrides = []): ProjectSprint
{
    return ProjectSprint::create(array_merge([
        'tenant_id'  => test()->tenant->id,
        'project_id' => $project->id,
        'name'       => 'Sprint ' . uniqid(),
        'status'     => 'planning',
    ], $overrides));
}

// ========================
// Tests
// ========================

// 1. Sprints index renders for a project
it('sprints index renders for a project', function () {
    $project = makePmSprintProject();
    makePmSprint($project);

    $this->get("/pm/projects/{$project->id}/sprints")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('PM/Sprints/Index'));
});

// 2. Can create a sprint
it('can create a sprint', function () {
    $project = makePmSprintProject();

    $this->post("/pm/projects/{$project->id}/sprints", [
        'name' => 'Sprint Alpha',
    ])->assertRedirect();

    expect(ProjectSprint::where('name', 'Sprint Alpha')->where('project_id', $project->id)->exists())->toBeTrue();
});

// 3. Sprint store validates required fields
it('sprint store validates required name', function () {
    $project = makePmSprintProject();

    $this->post("/pm/projects/{$project->id}/sprints", [])->assertSessionHasErrors('name');
});

// 4. Can activate a sprint
it('can activate a sprint', function () {
    $project = makePmSprintProject();
    $sprint  = makePmSprint($project, ['status' => 'planning']);

    $this->post("/pm/projects/{$project->id}/sprints/{$sprint->id}/activate")
        ->assertRedirect();

    expect($sprint->fresh()->status)->toBe('active');
});

// 5. Activating a sprint deactivates existing active sprint
it('activating a sprint deactivates the existing active sprint', function () {
    $project       = makePmSprintProject();
    $activeSprint  = makePmSprint($project, ['status' => 'active']);
    $newSprint     = makePmSprint($project, ['status' => 'planning']);

    $this->post("/pm/projects/{$project->id}/sprints/{$newSprint->id}/activate")
        ->assertRedirect();

    expect($activeSprint->fresh()->status)->toBe('planning');
    expect($newSprint->fresh()->status)->toBe('active');
});

// 6. Can complete an active sprint
it('can complete an active sprint', function () {
    $project = makePmSprintProject();
    $sprint  = makePmSprint($project, ['status' => 'active']);

    $this->post("/pm/projects/{$project->id}/sprints/{$sprint->id}/complete")
        ->assertRedirect();

    expect($sprint->fresh()->status)->toBe('completed');
});

// 7. Gantt data endpoint returns task data
it('gantt data endpoint returns task data', function () {
    $project = makePmSprintProject();
    $task    = makePmSprintTask($project, [
        'start_date' => '2027-01-01',
        'due_date'   => '2027-01-15',
    ]);

    $this->getJson("/pm/projects/{$project->id}/gantt/data")
        ->assertOk()
        ->assertJsonStructure(['tasks', 'milestones']);
});

// 8. Gantt page renders
it('gantt page renders', function () {
    $project = makePmSprintProject();

    $this->get("/pm/projects/{$project->id}/gantt")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('PM/Gantt'));
});

// 9. ProjectSprint::complete() updates velocity from completed tasks' story_points
it('ProjectSprint complete updates velocity from completed tasks story points', function () {
    $project = makePmSprintProject();
    $sprint  = makePmSprint($project, ['status' => 'active']);

    makePmSprintTask($project, ['sprint_id' => $sprint->id, 'status' => 'done', 'story_points' => 5]);
    makePmSprintTask($project, ['sprint_id' => $sprint->id, 'status' => 'done', 'story_points' => 3]);
    makePmSprintTask($project, ['sprint_id' => $sprint->id, 'status' => 'todo', 'story_points' => 8]);

    $sprint->complete();

    expect($sprint->fresh()->status)->toBe('completed');
    expect($sprint->fresh()->velocity)->toBe(8); // only done tasks: 5 + 3
});

// 10. Project::activeSprint() returns the active sprint
it('Project activeSprint returns the active sprint', function () {
    $project       = makePmSprintProject();
    $planningSprint = makePmSprint($project, ['status' => 'planning']);
    $activeSprint  = makePmSprint($project, ['status' => 'active']);

    $result = $project->activeSprint();

    expect($result)->not->toBeNull();
    expect($result->id)->toBe($activeSprint->id);
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Kanban Co', 'slug' => 'kanban-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

function makeKanbanProject(): Project
{
    return Project::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Kanban Project',
        'status'     => 'active',
        'created_by' => test()->user->id,
    ]);
}

it('returns kanban view for project', function () {
    $project = makeKanbanProject();
    $this->get("/pm/projects/{$project->id}/tasks/kanban")->assertStatus(200);
});

it('kanban groups tasks by status', function () {
    $project = makeKanbanProject();
    Task::create([
        'tenant_id'  => test()->tenant->id,
        'project_id' => $project->id,
        'title'      => 'Task A',
        'status'     => 'todo',
        'created_by' => test()->user->id,
    ]);
    Task::create([
        'tenant_id'  => test()->tenant->id,
        'project_id' => $project->id,
        'title'      => 'Task B',
        'status'     => 'in_progress',
        'created_by' => test()->user->id,
    ]);
    $this->get("/pm/projects/{$project->id}/tasks/kanban")
         ->assertStatus(200)
         ->assertInertia(fn ($page) => $page
             ->component('PM/Tasks/Kanban')
             ->has('columns.todo', 1)
             ->has('columns.in_progress', 1)
         );
});

it('can move task to new status', function () {
    $project = makeKanbanProject();
    $task = Task::create([
        'tenant_id'  => test()->tenant->id,
        'project_id' => $project->id,
        'title'      => 'Movable Task',
        'status'     => 'todo',
        'created_by' => test()->user->id,
    ]);
    $this->patch("/pm/projects/{$project->id}/tasks/{$task->id}/move-status", ['status' => 'in_progress'])
         ->assertStatus(200)
         ->assertJson(['ok' => true]);
    expect($task->fresh()->status)->toBe('in_progress');
});

it('move-status rejects invalid status', function () {
    $project = makeKanbanProject();
    $task = Task::create([
        'tenant_id'  => test()->tenant->id,
        'project_id' => $project->id,
        'title'      => 'Task',
        'status'     => 'todo',
        'created_by' => test()->user->id,
    ]);
    $this->patchJson("/pm/projects/{$project->id}/tasks/{$task->id}/move-status", ['status' => 'invalid'])
         ->assertStatus(422);
});

it('returns calendar view for project', function () {
    $project = makeKanbanProject();
    $this->get("/pm/projects/{$project->id}/tasks/calendar")->assertStatus(200);
});

it('calendar filters tasks by month', function () {
    $project = makeKanbanProject();
    Task::create([
        'tenant_id'  => test()->tenant->id,
        'project_id' => $project->id,
        'title'      => 'Jan Task',
        'status'     => 'todo',
        'due_date'   => '2025-01-15',
        'created_by' => test()->user->id,
    ]);
    $this->get("/pm/projects/{$project->id}/tasks/calendar?year=2025&month=1")
         ->assertStatus(200)
         ->assertInertia(fn ($page) => $page
             ->component('PM/Tasks/Calendar')
             ->has('tasks', 1)
         );
});

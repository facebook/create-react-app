<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PM Co', 'slug' => 'pm-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('list projects returns paginated data', function () {
    Project::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Test Project',
        'status'     => 'active',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/pm/projects');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'success',
                 'data',
                 'meta' => ['total', 'per_page', 'current_page', 'last_page'],
             ])
             ->assertJson(['success' => true]);
});

test('unauthorized requests rejected from projects list', function () {
    $this->getJson('/api/v1/pm/projects')->assertStatus(401);
});

test('creates a project', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/pm/projects', [
        'name'        => 'New Project',
        'description' => 'Project description',
        'status'      => 'draft',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('success', true)
             ->assertJsonPath('data.name', 'New Project');

    $this->assertDatabaseHas('projects', ['name' => 'New Project']);
});

test('list tasks returns paginated data', function () {
    $project = Project::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Task Project',
        'status'     => 'active',
        'created_by' => $this->user->id,
    ]);

    Task::create([
        'tenant_id'  => $this->tenant->id,
        'project_id' => $project->id,
        'title'      => 'Test Task',
        'status'     => 'todo',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/pm/tasks');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta'])
             ->assertJson(['success' => true]);
});

test('filters tasks by project_id', function () {
    $project = Project::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Filter Project',
        'status'     => 'active',
        'created_by' => $this->user->id,
    ]);

    Task::create([
        'tenant_id'  => $this->tenant->id,
        'project_id' => $project->id,
        'title'      => 'Filtered Task',
        'status'     => 'in_progress',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson("/api/v1/pm/tasks?project_id={$project->id}");

    $response->assertStatus(200)
             ->assertJson(['success' => true]);
});

test('creates a task', function () {
    $project = Project::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Store Task Project',
        'status'     => 'active',
        'created_by' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->postJson('/api/v1/pm/tasks', [
        'project_id' => $project->id,
        'title'      => 'New Task',
        'status'     => 'todo',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('success', true)
             ->assertJsonPath('data.title', 'New Task');
});

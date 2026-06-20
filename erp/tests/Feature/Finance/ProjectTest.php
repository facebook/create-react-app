<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Project;
use App\Modules\Finance\Models\ProjectTask;
use App\Modules\Finance\Models\ProjectTimeEntry;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Proj Co', 'slug' => 'proj-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeProject(string $name = 'Test Project', string $status = 'planning'): Project
{
    return Project::create([
        'tenant_id'    => app('tenant')->id,
        'name'         => $name,
        'status'       => $status,
        'billing_type' => 'hourly',
        'hourly_rate'  => 100,
    ]);
}

test('admin can list projects', function () {
    $this->get('/finance/projects')
        ->assertStatus(200);
});

test('admin can create a project', function () {
    $this->post('/finance/projects', [
        'name'         => 'New Project',
        'billing_type' => 'hourly',
        'hourly_rate'  => 100,
    ])->assertRedirect();

    expect(Project::where('name', 'New Project')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('store requires name and billing_type', function () {
    $this->postJson('/finance/projects', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'billing_type']);
});

test('admin can view a project', function () {
    $project = makeProject();

    $this->get("/finance/projects/{$project->id}")
        ->assertStatus(200);
});

test('admin can activate a project', function () {
    $project = makeProject('Activate Me', 'planning');

    $this->post("/finance/projects/{$project->id}/activate")
        ->assertRedirect();

    expect(Project::find($project->id)->status)->toBe('active');
});

test('admin can complete a project', function () {
    $project = makeProject('Complete Me', 'active');

    $this->post("/finance/projects/{$project->id}/complete")
        ->assertRedirect();

    expect(Project::find($project->id)->status)->toBe('completed');
});

test('admin can add a task', function () {
    $project = makeProject();

    $this->post("/finance/projects/{$project->id}/tasks", [
        'title'    => 'My Task',
        'priority' => 'high',
    ])->assertRedirect();

    expect(ProjectTask::where('project_id', $project->id)->where('title', 'My Task')->exists())->toBeTrue();
});

test('admin can add a time entry', function () {
    $project = makeProject();

    $this->post("/finance/projects/{$project->id}/time-entries", [
        'hours'      => 2.5,
        'entry_date' => now()->toDateString(),
    ])->assertRedirect();

    expect(ProjectTimeEntry::where('project_id', $project->id)->where('hours', 2.5)->exists())->toBeTrue();
});

test('total_hours accessor sums time entries', function () {
    $project = makeProject();

    ProjectTimeEntry::create([
        'tenant_id'  => $this->tenant->id,
        'project_id' => $project->id,
        'user_id'    => $this->admin->id,
        'hours'      => 2.5,
        'entry_date' => now()->toDateString(),
        'is_billable' => true,
    ]);

    ProjectTimeEntry::create([
        'tenant_id'  => $this->tenant->id,
        'project_id' => $project->id,
        'user_id'    => $this->admin->id,
        'hours'      => 1.5,
        'entry_date' => now()->toDateString(),
        'is_billable' => false,
    ]);

    expect($project->total_hours)->toBe(4.0);
});

test('staff cannot delete a project', function () {
    $project = makeProject();

    $this->actingAs($this->staff)
        ->delete("/finance/projects/{$project->id}")
        ->assertStatus(403);
});

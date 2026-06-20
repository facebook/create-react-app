<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\MentorshipProgram;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'MentorCorp', 'slug' => 'mentor-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeMentorEmployee(array $attrs = []): Employee
{
    return Employee::create([
        'tenant_id'       => test()->tenant->id,
        'first_name'      => 'Mentor',
        'last_name'       => 'Person ' . uniqid(),
        'employee_number' => 'EMP-M-' . uniqid(),
        'start_date'      => now()->toDateString(),
        ...$attrs,
    ]);
}

function makeMentorshipProgram(array $attrs = []): MentorshipProgram
{
    $mentor = makeMentorEmployee();
    $mentee = makeMentorEmployee();
    return MentorshipProgram::create([
        'tenant_id'  => test()->tenant->id,
        'mentor_id'  => $mentor->id,
        'mentee_id'  => $mentee->id,
        'title'      => 'Program ' . uniqid(),
        'start_date' => now()->toDateString(),
        'created_by' => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/mentorship-programs')->assertRedirect('/login');
});

it('admin can list mentorship programs', function () {
    makeMentorshipProgram();
    $this->get('/hr/mentorship-programs')->assertOk();
});

it('store creates a mentorship program', function () {
    $mentor = makeMentorEmployee();
    $mentee = makeMentorEmployee();
    $this->post('/hr/mentorship-programs', [
        'mentor_id'  => $mentor->id,
        'mentee_id'  => $mentee->id,
        'title'      => 'Leadership Mentorship',
        'start_date' => now()->toDateString(),
    ])->assertRedirect();

    expect(MentorshipProgram::where('title', 'Leadership Mentorship')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/mentorship-programs', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['mentor_id', 'mentee_id', 'title', 'start_date']);
});

it('show displays a mentorship program', function () {
    $program = makeMentorshipProgram();
    $this->get("/hr/mentorship-programs/{$program->id}")->assertOk();
});

it('complete transitions status to completed', function () {
    $program = makeMentorshipProgram();
    expect($program->status)->toBe('active');

    $this->post("/hr/mentorship-programs/{$program->id}/complete")->assertRedirect();

    $program->refresh();
    expect($program->status)->toBe('completed');
    expect($program->is_completed)->toBeTrue();
});

it('pause and resume work correctly', function () {
    $program = makeMentorshipProgram();
    $this->post("/hr/mentorship-programs/{$program->id}/pause")->assertRedirect();
    $program->refresh();
    expect($program->status)->toBe('paused');

    $this->post("/hr/mentorship-programs/{$program->id}/resume")->assertRedirect();
    $program->refresh();
    expect($program->status)->toBe('active');
    expect($program->is_active)->toBeTrue();
});

it('logSession increments sessions_completed', function () {
    $program = makeMentorshipProgram(['sessions_completed' => 2, 'sessions_planned' => 10]);
    $this->post("/hr/mentorship-programs/{$program->id}/log-session")->assertRedirect();
    $program->refresh();
    expect($program->sessions_completed)->toBe(3);
});

it('progress_percent accessor works', function () {
    $program = makeMentorshipProgram(['sessions_completed' => 3, 'sessions_planned' => 10]);
    expect($program->progress_percent)->toBe(30);
});

it('destroy soft-deletes the program', function () {
    $program = makeMentorshipProgram();
    $this->delete("/hr/mentorship-programs/{$program->id}")->assertRedirect();
    expect(MentorshipProgram::find($program->id))->toBeNull();
    expect(MentorshipProgram::withTrashed()->find($program->id))->not->toBeNull();
});

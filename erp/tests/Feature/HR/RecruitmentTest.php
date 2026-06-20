<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\JobApplication;
use App\Modules\HR\Models\JobPosition;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Recruit Corp', 'slug' => 'recruit-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePosition(): JobPosition
{
    return JobPosition::create([
        'tenant_id'       => test()->tenant->id,
        'title'           => 'Software Engineer',
        'employment_type' => 'full_time',
        'openings'        => 2,
        'is_active'       => true,
    ]);
}

function makeApplication(JobPosition $position, string $status = 'new'): JobApplication
{
    return JobApplication::create([
        'tenant_id'       => test()->tenant->id,
        'job_position_id' => $position->id,
        'applicant_name'  => 'John Doe',
        'applicant_email' => 'john.' . uniqid() . '@test.com',
        'status'          => $status,
    ]);
}

it('admin can list job positions', function () {
    $this->get('/hr/job-positions')->assertStatus(200);
});

it('admin can create a job position', function () {
    $this->post('/hr/job-positions', [
        'title'           => 'Data Analyst',
        'employment_type' => 'full_time',
        'openings'        => 1,
    ])->assertRedirect();
    expect(JobPosition::where('title', 'Data Analyst')->exists())->toBeTrue();
});

it('position store validates required fields', function () {
    $this->postJson('/hr/job-positions', [])->assertStatus(422)
        ->assertJsonValidationErrors(['title', 'employment_type']);
});

it('admin can view a job position', function () {
    $pos = makePosition();
    $this->get("/hr/job-positions/{$pos->id}")->assertStatus(200);
});

it('admin can list job applications', function () {
    $this->get('/hr/job-applications')->assertStatus(200);
});

it('admin can create an application', function () {
    $pos = makePosition();
    $this->post('/hr/job-applications', [
        'job_position_id' => $pos->id,
        'applicant_name'  => 'Jane Doe',
        'applicant_email' => 'jane@example.com',
    ])->assertRedirect();
    expect(JobApplication::where('applicant_email', 'jane@example.com')->exists())->toBeTrue();
});

it('admin can advance an application status', function () {
    $pos = makePosition();
    $app = makeApplication($pos);
    $this->post("/hr/job-applications/{$app->id}/advance", ['status' => 'screening'])->assertRedirect();
    expect($app->fresh()->status)->toBe('screening');
});

it('admin can hire an applicant', function () {
    $pos = makePosition();
    $app = makeApplication($pos, 'offer');
    $this->post("/hr/job-applications/{$app->id}/hire")->assertRedirect();
    expect($app->fresh()->status)->toBe('hired');
});

it('admin can reject an applicant', function () {
    $pos = makePosition();
    $app = makeApplication($pos);
    $this->post("/hr/job-applications/{$app->id}/reject", ['notes' => 'Not a fit'])->assertRedirect();
    expect($app->fresh()->status)->toBe('rejected');
    expect($app->fresh()->notes)->toBe('Not a fit');
});

it('is_open returns false when closes_at is in the past', function () {
    $pos = makePosition();
    \Illuminate\Support\Facades\DB::table('job_positions')->where('id', $pos->id)
        ->update(['closes_at' => now()->subDay()->toDateString()]);
    expect($pos->fresh()->is_open)->toBeFalse();
});

it('staff cannot delete a job position', function () {
    $pos = makePosition();
    $this->actingAs($this->staff)
        ->delete("/hr/job-positions/{$pos->id}")
        ->assertStatus(403);
});

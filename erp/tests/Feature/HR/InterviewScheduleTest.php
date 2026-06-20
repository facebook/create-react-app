<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\InterviewSchedule;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'InterviewCorp', 'slug' => 'interview-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeInterviewSchedule(array $attrs = []): InterviewSchedule
{
    return InterviewSchedule::create([
        'tenant_id'      => test()->tenant->id,
        'candidate_name' => 'Candidate ' . uniqid(),
        'position_title' => 'Engineer',
        'scheduled_at'   => now()->addDay(),
        'created_by'     => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/interview-schedules')->assertRedirect('/login');
});

it('admin can list interview schedules', function () {
    makeInterviewSchedule();
    $this->get('/hr/interview-schedules')->assertOk();
});

it('store creates an interview schedule', function () {
    $this->post('/hr/interview-schedules', [
        'candidate_name' => 'Jane Applicant',
        'position_title' => 'Product Manager',
        'scheduled_at'   => now()->addDays(3)->toDateTimeString(),
    ])->assertRedirect();

    expect(InterviewSchedule::where('candidate_name', 'Jane Applicant')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/interview-schedules', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['candidate_name', 'position_title', 'scheduled_at']);
});

it('show displays an interview schedule', function () {
    $interview = makeInterviewSchedule();
    $this->get("/hr/interview-schedules/{$interview->id}")->assertOk();
});

it('confirm transitions status to confirmed', function () {
    $interview = makeInterviewSchedule();
    expect($interview->status)->toBe('scheduled');
    expect($interview->is_scheduled)->toBeTrue();

    $this->post("/hr/interview-schedules/{$interview->id}/confirm")->assertRedirect();

    $interview->refresh();
    expect($interview->status)->toBe('confirmed');
    expect($interview->is_confirmed)->toBeTrue();
});

it('complete transitions status to completed', function () {
    $interview = makeInterviewSchedule(['status' => 'confirmed']);
    $this->post("/hr/interview-schedules/{$interview->id}/complete", [
        'outcome'  => 'pass',
        'feedback' => 'Strong candidate',
    ])->assertRedirect();
    $interview->refresh();
    expect($interview->status)->toBe('completed');
    expect($interview->outcome)->toBe('pass');
    expect($interview->is_completed)->toBeTrue();
});

it('cancel transitions status to cancelled', function () {
    $interview = makeInterviewSchedule();
    $this->post("/hr/interview-schedules/{$interview->id}/cancel")->assertRedirect();
    $interview->refresh();
    expect($interview->status)->toBe('cancelled');
});

it('no-show transitions status to no-show', function () {
    $interview = makeInterviewSchedule(['status' => 'confirmed']);
    $this->post("/hr/interview-schedules/{$interview->id}/no-show")->assertRedirect();
    $interview->refresh();
    expect($interview->status)->toBe('no-show');
});

it('destroy soft-deletes the interview', function () {
    $interview = makeInterviewSchedule();
    $this->delete("/hr/interview-schedules/{$interview->id}")->assertRedirect();
    expect(InterviewSchedule::find($interview->id))->toBeNull();
    expect(InterviewSchedule::withTrashed()->find($interview->id))->not->toBeNull();
});

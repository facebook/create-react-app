<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\TrainingCourse;
use App\Modules\HR\Models\TrainingSession;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SessionCorp', 'slug' => 'session-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeTSCourse(array $attrs = []): TrainingCourse
{
    return TrainingCourse::create([
        'tenant_id' => test()->tenant->id,
        'title'     => 'Course ' . uniqid(),
        ...$attrs,
    ]);
}

function makeTrainingSession(array $attrs = []): TrainingSession
{
    $course = makeTSCourse();
    return TrainingSession::create([
        'tenant_id'          => test()->tenant->id,
        'training_course_id' => $course->id,
        'title'              => 'Session ' . uniqid(),
        'scheduled_at'       => now()->addDay(),
        'created_by'         => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/training-sessions')->assertRedirect('/login');
});

it('admin can list training sessions', function () {
    makeTrainingSession();
    $this->get('/hr/training-sessions')->assertOk();
});

it('store creates a training session', function () {
    $course = makeTSCourse();
    $this->post('/hr/training-sessions', [
        'training_course_id' => $course->id,
        'title'              => 'Onboarding Session',
        'scheduled_at'       => now()->addWeek()->toDateTimeString(),
    ])->assertRedirect();

    expect(TrainingSession::where('title', 'Onboarding Session')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/training-sessions', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['training_course_id', 'title', 'scheduled_at']);
});

it('show displays a training session', function () {
    $session = makeTrainingSession();
    $this->get("/hr/training-sessions/{$session->id}")->assertOk();
});

it('start transitions status to in-progress', function () {
    $session = makeTrainingSession();
    expect($session->status)->toBe('scheduled');
    expect($session->is_scheduled)->toBeTrue();

    $this->post("/hr/training-sessions/{$session->id}/start")->assertRedirect();

    $session->refresh();
    expect($session->status)->toBe('in-progress');
});

it('complete transitions status to completed', function () {
    $session = makeTrainingSession(['status' => 'in-progress']);
    $this->post("/hr/training-sessions/{$session->id}/complete")->assertRedirect();
    $session->refresh();
    expect($session->status)->toBe('completed');
});

it('cancel transitions status to cancelled', function () {
    $session = makeTrainingSession();
    $this->post("/hr/training-sessions/{$session->id}/cancel")->assertRedirect();
    $session->refresh();
    expect($session->status)->toBe('cancelled');
});

it('spots_remaining and is_full accessors work', function () {
    $session = makeTrainingSession(['max_participants' => 5, 'enrolled_count' => 3]);
    expect($session->spots_remaining)->toBe(2);
    expect($session->is_full)->toBeFalse();

    $session->enrolled_count = 5;
    expect($session->is_full)->toBeTrue();
    expect($session->spots_remaining)->toBe(0);
});

it('destroy soft-deletes the session', function () {
    $session = makeTrainingSession();
    $this->delete("/hr/training-sessions/{$session->id}")->assertRedirect();
    expect(TrainingSession::find($session->id))->toBeNull();
    expect(TrainingSession::withTrashed()->find($session->id))->not->toBeNull();
});

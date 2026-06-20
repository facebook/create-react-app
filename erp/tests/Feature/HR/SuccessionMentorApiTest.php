<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\MentorshipProgram;
use App\Modules\HR\Models\SuccessionCandidate;
use App\Modules\HR\Models\SuccessionPlan;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SP Co', 'slug' => 'sp-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeApiSPEmployee(string $firstName = 'SP'): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'first_name' => $firstName,
        'last_name'  => 'Person ' . uniqid(),
        'start_date' => now()->toDateString(),
        'status'     => 'active',
    ]);
}

function makeApiSuccessionPlan(array $attrs = []): SuccessionPlan
{
    return SuccessionPlan::create(array_merge([
        'tenant_id'      => test()->tenant->id,
        'position_title' => 'CTO ' . uniqid(),
        'status'         => 'active',
        'created_by'     => test()->user->id,
    ], $attrs));
}

function makeApiMentorshipProgram(Employee $mentor, Employee $mentee, string $status = 'active'): MentorshipProgram
{
    return MentorshipProgram::create([
        'tenant_id'        => test()->tenant->id,
        'mentor_id'        => $mentor->id,
        'mentee_id'        => $mentee->id,
        'title'            => 'Leadership Program ' . uniqid(),
        'start_date'       => now()->toDateString(),
        'sessions_planned' => 12,
        'status'           => $status,
        'created_by'       => test()->user->id,
    ]);
}

// ── Succession Plans ──────────────────────────────────────────────────────────

test('can create a succession plan', function () {
    $holder = makeApiSPEmployee('Current');

    $this->withToken($this->token)
        ->postJson('/api/v1/succession-plans', [
            'position_title'    => 'VP Engineering',
            'department'        => 'Technology',
            'is_critical'       => true,
            'current_holder_id' => $holder->id,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.position_title', 'VP Engineering')
        ->assertJsonPath('data.status', 'active');
});

test('can list succession plans', function () {
    makeApiSuccessionPlan();
    makeApiSuccessionPlan(['is_critical' => true]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/succession-plans')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter succession plans by critical', function () {
    makeApiSuccessionPlan(['is_critical' => false]);
    makeApiSuccessionPlan(['is_critical' => true]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/succession-plans?critical_only=1')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['is_critical'])->toBeTrue();
    }
});

test('can view a succession plan with candidates', function () {
    $plan = makeApiSuccessionPlan();
    $emp  = makeApiSPEmployee('Candidate');

    SuccessionCandidate::create([
        'succession_plan_id' => $plan->id,
        'employee_id'        => $emp->id,
        'readiness_level'    => 'developing',
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/succession-plans/{$plan->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['candidates']]);
});

test('can add a candidate to a succession plan', function () {
    $plan = makeApiSuccessionPlan();
    $emp  = makeApiSPEmployee('Candidate');

    $this->withToken($this->token)
        ->postJson("/api/v1/succession-plans/{$plan->id}/candidates", [
            'employee_id'     => $emp->id,
            'readiness_level' => 'ready',
            'readiness_score' => 85,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.readiness_level', 'ready');
});

test('can remove a candidate from a succession plan', function () {
    $plan      = makeApiSuccessionPlan();
    $emp       = makeApiSPEmployee('Candidate');
    $candidate = SuccessionCandidate::create([
        'succession_plan_id' => $plan->id,
        'employee_id'        => $emp->id,
        'readiness_level'    => 'not-ready',
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/succession-plans/{$plan->id}/candidates/{$candidate->id}")
        ->assertStatus(200);

    expect(SuccessionCandidate::find($candidate->id))->toBeNull();
});

test('can complete a succession plan', function () {
    $plan = makeApiSuccessionPlan();

    $this->withToken($this->token)
        ->postJson("/api/v1/succession-plans/{$plan->id}/complete")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'completed');
});

// ── Mentorship Programs ───────────────────────────────────────────────────────

test('can create a mentorship program', function () {
    $mentor = makeApiSPEmployee('Mentor');
    $mentee = makeApiSPEmployee('Mentee');

    $this->withToken($this->token)
        ->postJson('/api/v1/mentorship-programs', [
            'mentor_id'        => $mentor->id,
            'mentee_id'        => $mentee->id,
            'title'            => 'Technical Leadership',
            'start_date'       => now()->toDateString(),
            'sessions_planned' => 10,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'active');
});

test('can list mentorship programs', function () {
    $mentor = makeApiSPEmployee('Mentor');
    $mentee = makeApiSPEmployee('Mentee');
    makeApiMentorshipProgram($mentor, $mentee);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/mentorship-programs')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can log a session for a mentorship program', function () {
    $mentor  = makeApiSPEmployee('Mentor');
    $mentee  = makeApiSPEmployee('Mentee');
    $program = makeApiMentorshipProgram($mentor, $mentee);

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/mentorship-programs/{$program->id}/log-session")
        ->assertStatus(200);

    expect($response->json('data.sessions_completed'))->toBe(1);
});

test('can pause a mentorship program', function () {
    $mentor  = makeApiSPEmployee('Mentor');
    $mentee  = makeApiSPEmployee('Mentee');
    $program = makeApiMentorshipProgram($mentor, $mentee, 'active');

    $this->withToken($this->token)
        ->postJson("/api/v1/mentorship-programs/{$program->id}/pause")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'paused');
});

test('can complete a mentorship program', function () {
    $mentor  = makeApiSPEmployee('Mentor');
    $mentee  = makeApiSPEmployee('Mentee');
    $program = makeApiMentorshipProgram($mentor, $mentee);

    $this->withToken($this->token)
        ->postJson("/api/v1/mentorship-programs/{$program->id}/complete")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'completed');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/succession-plans')->assertStatus(401);
});

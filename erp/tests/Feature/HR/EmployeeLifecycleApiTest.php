<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeExit;
use App\Modules\HR\Models\EmployeePositionChange;
use App\Modules\HR\Models\OnboardingChecklist;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'LC Co', 'slug' => 'lc-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeLCEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'first_name' => 'LC',
        'last_name'  => 'Person ' . uniqid(),
        'start_date' => now()->toDateString(),
        'status'     => 'active',
    ]);
}

// ── Onboarding Checklists ─────────────────────────────────────────────────────

test('can create an onboarding checklist with tasks', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/onboarding-checklists', [
            'name'       => 'Engineering Onboarding',
            'department' => 'Engineering',
            'tasks'      => [
                ['title' => 'Set up laptop', 'due_day_offset' => 1, 'sort_order' => 1],
                ['title' => 'Review codebase', 'due_day_offset' => 3, 'sort_order' => 2],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Engineering Onboarding')
        ->assertJsonStructure(['data' => ['tasks']]);
});

test('can list onboarding checklists', function () {
    OnboardingChecklist::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Sales Onboarding',
        'is_active' => true,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/onboarding-checklists')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can view an onboarding checklist', function () {
    $checklist = OnboardingChecklist::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'HR Onboarding',
        'is_active' => true,
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/onboarding-checklists/{$checklist->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'name', 'tasks']]);
});

test('can delete an onboarding checklist', function () {
    $checklist = OnboardingChecklist::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Temp Onboarding',
        'is_active' => true,
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/onboarding-checklists/{$checklist->id}")
        ->assertStatus(200);

    expect(OnboardingChecklist::withTrashed()->find($checklist->id)?->deleted_at)->not->toBeNull();
});

// ── Position Changes ──────────────────────────────────────────────────────────

test('can create a position change (promotion)', function () {
    $emp = makeLCEmployee();

    $this->withToken($this->token)
        ->postJson('/api/v1/position-changes', [
            'employee_id'    => $emp->id,
            'change_type'    => 'promotion',
            'from_title'     => 'Junior Developer',
            'to_title'       => 'Senior Developer',
            'from_salary'    => 50000,
            'to_salary'      => 70000,
            'effective_date' => now()->addDays(7)->toDateString(),
            'reason'         => 'Outstanding performance',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.change_type', 'promotion');
});

test('can list position changes', function () {
    $emp = makeLCEmployee();

    EmployeePositionChange::create([
        'tenant_id'      => $this->tenant->id,
        'employee_id'    => $emp->id,
        'change_type'    => 'transfer',
        'effective_date' => now()->toDateString(),
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/position-changes')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can approve a position change', function () {
    $emp = makeLCEmployee();

    $change = EmployeePositionChange::create([
        'tenant_id'      => $this->tenant->id,
        'employee_id'    => $emp->id,
        'change_type'    => 'promotion',
        'to_title'       => 'Lead',
        'effective_date' => now()->addDays(7)->toDateString(),
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/position-changes/{$change->id}/approve")
        ->assertStatus(200);

    expect($change->fresh()->approved_by)->toBe($this->user->id);
});

// ── Employee Exits ────────────────────────────────────────────────────────────

test('can create an employee exit record', function () {
    $emp = makeLCEmployee();

    $this->withToken($this->token)
        ->postJson('/api/v1/employee-exits', [
            'employee_id' => $emp->id,
            'exit_date'   => now()->addDays(30)->toDateString(),
            'exit_type'   => 'resignation',
            'reason'      => 'Better opportunity',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.exit_type', 'resignation');
});

test('can list employee exits', function () {
    $emp = makeLCEmployee();

    EmployeeExit::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $emp->id,
        'exit_date'   => now()->addDays(30)->toDateString(),
        'exit_type'   => 'retirement',
        'status'      => 'pending',
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/employee-exits')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can mark an exit as in progress', function () {
    $emp = makeLCEmployee();

    $exit = EmployeeExit::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $emp->id,
        'exit_date'   => now()->addDays(14)->toDateString(),
        'exit_type'   => 'resignation',
        'status'      => 'pending',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/employee-exits/{$exit->id}/mark-in-progress")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'in_progress');
});

test('can complete an employee exit', function () {
    $emp = makeLCEmployee();

    $exit = EmployeeExit::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $emp->id,
        'exit_date'   => now()->addDays(7)->toDateString(),
        'exit_type'   => 'termination',
        'status'      => 'in_progress',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/employee-exits/{$exit->id}/complete", [
            'equipment_returned' => true,
            'access_revoked'     => true,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'completed');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/onboarding-checklists')->assertStatus(401);
});

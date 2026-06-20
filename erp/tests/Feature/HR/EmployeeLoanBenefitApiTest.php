<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\BenefitPlan;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeBenefit;
use App\Modules\HR\Models\EmployeeLoan;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'LB Co', 'slug' => 'lb-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeLBEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'first_name' => 'LB',
        'last_name'  => 'Worker ' . uniqid(),
        'start_date' => now()->toDateString(),
        'status'     => 'active',
    ]);
}

function makeLBBenefitPlan(string $type = 'health'): BenefitPlan
{
    return BenefitPlan::create([
        'tenant_id'     => test()->tenant->id,
        'name'          => ucfirst($type) . ' Plan ' . uniqid(),
        'type'          => $type,
        'employee_cost' => 50.00,
        'employer_cost' => 200.00,
        'is_active'     => true,
    ]);
}

// ── Employee Loans ────────────────────────────────────────────────────────────

test('can create an employee loan', function () {
    $emp = makeLBEmployee();

    $this->withToken($this->token)
        ->postJson('/api/v1/employee-loans', [
            'employee_id'   => $emp->id,
            'type'          => 'loan',
            'amount'        => 5000.00,
            'interest_rate' => 5.0,
            'purpose'       => 'Home renovation',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.type', 'loan');
});

test('can list employee loans', function () {
    $emp = makeLBEmployee();

    EmployeeLoan::create([
        'tenant_id'           => $this->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'advance',
        'amount'              => 1000,
        'outstanding_balance' => 1000,
        'status'              => 'pending',
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/employee-loans')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can view an employee loan', function () {
    $emp  = makeLBEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => $this->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 3000,
        'outstanding_balance' => 3000,
        'status'              => 'pending',
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/employee-loans/{$loan->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'status', 'amount', 'employee', 'repayments']]);
});

test('can approve an employee loan', function () {
    $emp  = makeLBEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => $this->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 2000,
        'outstanding_balance' => 2000,
        'status'              => 'pending',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/employee-loans/{$loan->id}/approve")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'active');
});

test('can record a loan repayment and update balance', function () {
    $emp  = makeLBEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => $this->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 1000,
        'outstanding_balance' => 1000,
        'status'              => 'active',
        'approved_by'         => $this->user->id,
        'approved_at'         => now(),
        'disbursed_at'        => now(),
    ]);

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/employee-loans/{$loan->id}/repayments", [
            'amount'       => 300.00,
            'payment_date' => now()->toDateString(),
        ])
        ->assertStatus(200);

    expect((float) $response->json('data.outstanding_balance'))->toBe(700.0);
});

test('loan marked completed when balance reaches zero', function () {
    $emp  = makeLBEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => $this->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'advance',
        'amount'              => 500,
        'outstanding_balance' => 500,
        'status'              => 'active',
        'approved_by'         => $this->user->id,
        'approved_at'         => now(),
        'disbursed_at'        => now(),
    ]);

    $response = $this->withToken($this->token)
        ->postJson("/api/v1/employee-loans/{$loan->id}/repayments", [
            'amount'       => 500.00,
            'payment_date' => now()->toDateString(),
        ])
        ->assertStatus(200);

    expect($response->json('data.status'))->toBe('completed');
});

test('can cancel a pending loan', function () {
    $emp  = makeLBEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => $this->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 2000,
        'outstanding_balance' => 2000,
        'status'              => 'pending',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/employee-loans/{$loan->id}/cancel")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'cancelled');
});

// ── Benefit Plans ─────────────────────────────────────────────────────────────

test('can create a benefit plan', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/benefit-plans', [
            'name'          => 'Premium Health',
            'type'          => 'health',
            'employee_cost' => 100.00,
            'employer_cost' => 400.00,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.type', 'health');
});

test('can list benefit plans', function () {
    makeLBBenefitPlan('health');
    makeLBBenefitPlan('dental');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/benefit-plans')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can enroll an employee in a benefit plan', function () {
    $emp  = makeLBEmployee();
    $plan = makeLBBenefitPlan('vision');

    $this->withToken($this->token)
        ->postJson("/api/v1/benefit-plans/{$plan->id}/enroll", [
            'employee_id' => $emp->id,
            'enrolled_at' => now()->toDateString(),
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'active');
});

test('can end a benefit enrollment', function () {
    $emp        = makeLBEmployee();
    $plan       = makeLBBenefitPlan('life');
    $enrollment = EmployeeBenefit::create([
        'tenant_id'       => $this->tenant->id,
        'employee_id'     => $emp->id,
        'benefit_plan_id' => $plan->id,
        'enrolled_at'     => now()->toDateString(),
        'status'          => 'active',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/benefit-plans/{$plan->id}/enrollments/{$enrollment->id}/end")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'ended');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/employee-loans')->assertStatus(401);
});

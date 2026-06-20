<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\BenefitPlan;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeBenefit;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Benefits Corp', 'slug' => 'benefits-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeBenPlan(string $type = 'health'): BenefitPlan
{
    return BenefitPlan::create([
        'tenant_id'     => test()->tenant->id,
        'name'          => 'Standard ' . ucfirst($type),
        'type'          => $type,
        'employee_cost' => 150.00,
        'employer_cost' => 400.00,
        'is_active'     => true,
    ]);
}

function makeBenEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'Ben',
        'last_name'  => 'Efit',
        'email'      => 'ben.efit.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);
}

function makeBenEnrollment(string $status = 'active'): EmployeeBenefit
{
    $plan = makeBenPlan();
    $emp  = makeBenEmployee();
    return EmployeeBenefit::create([
        'tenant_id'       => test()->tenant->id,
        'employee_id'     => $emp->id,
        'benefit_plan_id' => $plan->id,
        'enrolled_at'     => now()->toDateString(),
        'status'          => $status,
    ]);
}

it('admin can list benefit plans', function () {
    $this->get('/hr/benefit-plans')->assertStatus(200);
});

it('admin can create a benefit plan', function () {
    $this->post('/hr/benefit-plans', [
        'name'          => 'Premium Dental',
        'type'          => 'dental',
        'employee_cost' => 50,
        'employer_cost' => 200,
    ])->assertRedirect();
    expect(BenefitPlan::where('name', 'Premium Dental')->exists())->toBeTrue();
});

it('benefit plan store validates required fields', function () {
    $this->postJson('/hr/benefit-plans', [])->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'type']);
});

it('total_cost accessor sums employee and employer costs', function () {
    $plan = makeBenPlan();
    expect($plan->total_cost)->toBe(550.0);
});

it('admin can list employee benefits', function () {
    $this->get('/hr/employee-benefits')->assertStatus(200);
});

it('admin can enroll an employee in a benefit plan', function () {
    $plan = makeBenPlan();
    $emp  = makeBenEmployee();
    $this->post('/hr/employee-benefits', [
        'employee_id'     => $emp->id,
        'benefit_plan_id' => $plan->id,
        'enrolled_at'     => now()->toDateString(),
    ])->assertRedirect();
    expect(EmployeeBenefit::where('employee_id', $emp->id)->exists())->toBeTrue();
});

it('admin can waive a benefit', function () {
    $enrollment = makeBenEnrollment();
    $this->post("/hr/employee-benefits/{$enrollment->id}/waive")->assertRedirect();
    expect($enrollment->fresh()->status)->toBe('waived');
});

it('admin can end a benefit enrollment', function () {
    $enrollment = makeBenEnrollment();
    $this->post("/hr/employee-benefits/{$enrollment->id}/end")->assertRedirect();
    expect($enrollment->fresh()->status)->toBe('ended');
    expect($enrollment->fresh()->ended_at)->not->toBeNull();
});

it('is_active accessor returns true for active enrollment', function () {
    $enrollment = makeBenEnrollment('active');
    expect($enrollment->is_active)->toBeTrue();
    $enrollment->waive();
    expect($enrollment->is_active)->toBeFalse();
});

it('monthly_cost accessor returns plan employee cost', function () {
    $enrollment = makeBenEnrollment();
    $enrollment->load('plan');
    expect($enrollment->monthly_cost)->toBe(150.0);
});

it('staff cannot delete a benefit plan', function () {
    $plan = makeBenPlan();
    $this->actingAs($this->staff)
        ->delete("/hr/benefit-plans/{$plan->id}")
        ->assertStatus(403);
});

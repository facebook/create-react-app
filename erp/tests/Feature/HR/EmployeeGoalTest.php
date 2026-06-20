<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeGoal;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'GoalCorp', 'slug' => 'goal-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeGoalEmployee(array $attrs = []): Employee
{
    return Employee::create([
        'tenant_id'       => test()->tenant->id,
        'first_name'      => 'Goal',
        'last_name'       => 'Worker',
        'employee_number' => 'EMP-GOAL-' . uniqid(),
        'start_date'      => now()->toDateString(),
        ...$attrs,
    ]);
}

function makeEmployeeGoal(array $attrs = []): EmployeeGoal
{
    $employee = makeGoalEmployee();
    return EmployeeGoal::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $employee->id,
        'title'       => 'Goal ' . uniqid(),
        'start_date'  => now()->toDateString(),
        'due_date'    => now()->addMonth()->toDateString(),
        'created_by'  => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/employee-goals')->assertRedirect('/login');
});

it('admin can list employee goals', function () {
    makeEmployeeGoal();
    $this->get('/hr/employee-goals')->assertOk();
});

it('store creates an employee goal', function () {
    $employee = makeGoalEmployee();
    $this->post('/hr/employee-goals', [
        'employee_id' => $employee->id,
        'title'       => 'Increase Sales by 20%',
        'start_date'  => now()->toDateString(),
        'due_date'    => now()->addMonths(3)->toDateString(),
    ])->assertRedirect();

    expect(EmployeeGoal::where('title', 'Increase Sales by 20%')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/employee-goals', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['employee_id', 'title', 'start_date', 'due_date']);
});

it('show displays an employee goal', function () {
    $goal = makeEmployeeGoal();
    $this->get("/hr/employee-goals/{$goal->id}")->assertOk();
});

it('complete transitions status to completed', function () {
    $goal = makeEmployeeGoal();
    expect($goal->status)->toBe('active');

    $this->post("/hr/employee-goals/{$goal->id}/complete")->assertRedirect();

    $goal->refresh();
    expect($goal->status)->toBe('completed');
    expect($goal->progress_percent)->toBe(100);
    expect($goal->is_completed)->toBeTrue();
    expect($goal->completed_at)->not->toBeNull();
});

it('miss transitions status to missed', function () {
    $goal = makeEmployeeGoal();
    $this->post("/hr/employee-goals/{$goal->id}/miss")->assertRedirect();
    $goal->refresh();
    expect($goal->status)->toBe('missed');
});

it('cancel transitions status to cancelled', function () {
    $goal = makeEmployeeGoal();
    $this->post("/hr/employee-goals/{$goal->id}/cancel")->assertRedirect();
    $goal->refresh();
    expect($goal->status)->toBe('cancelled');
});

it('updateProgress updates progress_percent', function () {
    $goal = makeEmployeeGoal();
    $this->post("/hr/employee-goals/{$goal->id}/update-progress", ['progress' => 75])->assertRedirect();
    $goal->refresh();
    expect($goal->progress_percent)->toBe(75);
    expect($goal->status)->toBe('active');
});

it('updateProgress at 100 completes the goal', function () {
    $goal = makeEmployeeGoal();
    $this->post("/hr/employee-goals/{$goal->id}/update-progress", ['progress' => 100])->assertRedirect();
    $goal->refresh();
    expect($goal->status)->toBe('completed');
});

it('destroy soft-deletes the goal', function () {
    $goal = makeEmployeeGoal();
    $this->delete("/hr/employee-goals/{$goal->id}")->assertRedirect();
    expect(EmployeeGoal::find($goal->id))->toBeNull();
    expect(EmployeeGoal::withTrashed()->find($goal->id))->not->toBeNull();
});

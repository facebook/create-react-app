<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\OnboardingTemplate;
use App\Modules\HR\Models\EmployeeOnboarding;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Onboard Co', 'slug' => 'onboard-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeOnboardingEmployee(): Employee
{
    $dept = Department::create(['tenant_id' => test()->tenant->id, 'name' => 'Engineering']);
    return Employee::create([
        'tenant_id'     => test()->tenant->id,
        'first_name'    => 'John',
        'last_name'     => 'Doe',
        'email'         => 'john@example.com',
        'department_id' => $dept->id,
        'start_date'    => now()->toDateString(),
        'salary_amount' => 50000,
        'status'        => 'active',
    ]);
}

test('admin can list onboarding templates', function () {
    $this->get('/hr/onboarding-templates')
        ->assertStatus(200);
});

test('admin can create onboarding template with tasks', function () {
    $this->post('/hr/onboarding-templates', [
        'name'        => 'Standard Onboarding',
        'description' => 'Default onboarding checklist',
        'is_active'   => true,
        'tasks'       => [
            ['title' => 'Setup workstation', 'due_days' => 1, 'sort_order' => 0],
            ['title' => 'Complete HR paperwork', 'due_days' => 3, 'sort_order' => 1],
        ],
    ])->assertRedirect();

    $template = OnboardingTemplate::where('name', 'Standard Onboarding')->first();
    expect($template)->not->toBeNull();
    expect($template->tasks()->count())->toBe(2);
});

test('admin can view template', function () {
    $template = OnboardingTemplate::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Template',
    ]);

    $this->get("/hr/onboarding-templates/{$template->id}")
        ->assertStatus(200);
});

test('admin can create employee onboarding from template', function () {
    $employee = makeOnboardingEmployee();

    $template = OnboardingTemplate::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Quick Start',
    ]);
    $template->tasks()->create(['title' => 'Day 1 task', 'due_days' => 1, 'sort_order' => 0]);
    $template->tasks()->create(['title' => 'Week 1 task', 'due_days' => 7, 'sort_order' => 1]);

    $this->post("/hr/employees/{$employee->id}/onboardings", [
        'template_id' => $template->id,
        'started_at'  => '2026-01-01',
    ])->assertRedirect();

    $onboarding = EmployeeOnboarding::where('employee_id', $employee->id)->first();
    expect($onboarding)->not->toBeNull();
    expect($onboarding->tasks()->count())->toBe(2);
});

test('task due dates are computed from start date and due_days', function () {
    $employee = Employee::create([
        'tenant_id'     => $this->tenant->id,
        'first_name'    => 'Jane',
        'last_name'     => 'Smith',
        'email'         => 'jane@example.com',
        'start_date'    => '2026-01-01',
        'salary_amount' => 50000,
        'status'        => 'active',
    ]);

    $template = OnboardingTemplate::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Due Date Template',
    ]);
    $template->tasks()->create(['title' => 'Week 1 task', 'due_days' => 7, 'sort_order' => 0]);

    $onboarding = EmployeeOnboarding::fromTemplate($employee, $template);

    $task = $onboarding->tasks()->first();
    expect($task->due_date->toDateString())->toBe('2026-01-08');
});

test('admin can list employee onboardings', function () {
    $employee = makeOnboardingEmployee();

    $this->get("/hr/employees/{$employee->id}/onboardings")
        ->assertStatus(200);
});

test('admin can view employee onboarding', function () {
    $employee = makeOnboardingEmployee();

    $onboarding = EmployeeOnboarding::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $employee->id,
        'title'       => 'Test Onboarding',
        'status'      => 'in_progress',
        'started_at'  => now()->toDateString(),
    ]);

    $this->get("/hr/employees/{$employee->id}/onboardings/{$onboarding->id}")
        ->assertStatus(200);
});

test('admin can complete a task', function () {
    $employee = makeOnboardingEmployee();

    $onboarding = EmployeeOnboarding::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $employee->id,
        'title'       => 'Test Onboarding',
        'status'      => 'in_progress',
        'started_at'  => now()->toDateString(),
    ]);

    $task = $onboarding->tasks()->create([
        'title'      => 'Setup task',
        'sort_order' => 0,
    ]);

    $this->post("/hr/employees/{$employee->id}/onboardings/{$onboarding->id}/tasks/{$task->id}/complete")
        ->assertRedirect();

    expect($task->fresh()->completed_at)->not->toBeNull();
});

test('admin can uncomplete a task', function () {
    $employee = makeOnboardingEmployee();

    $onboarding = EmployeeOnboarding::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $employee->id,
        'title'       => 'Test Onboarding',
        'status'      => 'in_progress',
        'started_at'  => now()->toDateString(),
    ]);

    $task = $onboarding->tasks()->create([
        'title'        => 'Setup task',
        'sort_order'   => 0,
        'completed_at' => now(),
    ]);

    $this->post("/hr/employees/{$employee->id}/onboardings/{$onboarding->id}/tasks/{$task->id}/uncomplete")
        ->assertRedirect();

    expect($task->fresh()->completed_at)->toBeNull();
});

test('progress is 100 when all tasks complete', function () {
    $employee = makeOnboardingEmployee();

    $template = OnboardingTemplate::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Progress Template',
    ]);
    $template->tasks()->create(['title' => 'Task 1', 'due_days' => 0, 'sort_order' => 0]);
    $template->tasks()->create(['title' => 'Task 2', 'due_days' => 0, 'sort_order' => 1]);

    $onboarding = EmployeeOnboarding::fromTemplate($employee, $template);

    foreach ($onboarding->tasks as $task) {
        $task->update(['completed_at' => now()]);
    }

    expect($onboarding->progress)->toBe(100);
});

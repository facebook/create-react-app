<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\OnboardingChecklist;
use App\Modules\HR\Models\OnboardingTask;
use App\Modules\HR\Models\EmployeeOnboarding;
use App\Modules\HR\Models\OnboardingProgress;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Onboard Co', 'slug' => 'onboard-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeOnboardEmployee(): Employee {
    return Employee::create([
        'tenant_id'   => test()->tenant->id,
        'first_name'  => 'Jane',
        'last_name'   => 'Hire',
        'email'       => 'hire_' . uniqid() . '@example.com',
        'status'      => 'active',
        'start_date'  => now()->toDateString(),
    ]);
}

function makeOnboardChecklist(int $taskCount = 2): OnboardingChecklist {
    $checklist = OnboardingChecklist::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Standard Onboarding',
        'is_active'  => true,
    ]);
    for ($i = 1; $i <= $taskCount; $i++) {
        OnboardingTask::create([
            'tenant_id'                => test()->tenant->id,
            'onboarding_checklist_id'  => $checklist->id,
            'title'                    => "Task {$i}",
            'is_required'              => true,
            'due_day_offset'           => $i,
            'sort_order'               => $i,
        ]);
    }
    return $checklist;
}

it('admin can list onboarding checklists', function () {
    $this->get('/hr/onboarding-checklists')->assertStatus(200);
});

it('admin can create an onboarding checklist with tasks', function () {
    $this->post('/hr/onboarding-checklists', [
        'name'       => 'Dev Onboarding',
        'department' => 'Engineering',
        'tasks'      => [
            ['title' => 'Setup laptop',  'is_required' => true,  'due_day_offset' => 1, 'sort_order' => 1],
            ['title' => 'Meet the team', 'is_required' => false, 'due_day_offset' => 2, 'sort_order' => 2],
        ],
    ])->assertRedirect();
    $checklist = OnboardingChecklist::where('name', 'Dev Onboarding')->first();
    expect($checklist)->not->toBeNull();
    expect($checklist->tasks()->count())->toBe(2);
});

it('checklist store requires name', function () {
    $this->postJson('/hr/onboarding-checklists', ['name' => ''])
        ->assertStatus(422)->assertJsonValidationErrors(['name']);
});

it('admin can assign onboarding to employee with auto-progress', function () {
    $employee  = makeOnboardEmployee();
    $checklist = makeOnboardChecklist(3);
    $this->post('/hr/employee-onboardings', [
        'employee_id'              => $employee->id,
        'onboarding_checklist_id'  => $checklist->id,
        'start_date'               => now()->toDateString(),
    ])->assertRedirect();
    $onboarding = EmployeeOnboarding::where('employee_id', $employee->id)
        ->whereNotNull('onboarding_checklist_id')
        ->first();
    expect($onboarding)->not->toBeNull();
    expect($onboarding->progress()->count())->toBe(3);
    expect($onboarding->progress()->where('status', 'pending')->count())->toBe(3);
});

it('admin can view employee onboarding', function () {
    $employee  = makeOnboardEmployee();
    $checklist = makeOnboardChecklist(2);
    $onboarding = EmployeeOnboarding::create([
        'tenant_id'                => test()->tenant->id,
        'employee_id'              => $employee->id,
        'onboarding_checklist_id'  => $checklist->id,
        'start_date'               => now()->toDateString(),
        'status'                   => 'in_progress',
    ]);
    $this->get("/hr/employee-onboardings/{$onboarding->id}")->assertStatus(200);
});

it('admin can complete an onboarding task', function () {
    $employee  = makeOnboardEmployee();
    $checklist = makeOnboardChecklist(2);
    $onboarding = EmployeeOnboarding::create([
        'tenant_id'                => test()->tenant->id,
        'employee_id'              => $employee->id,
        'onboarding_checklist_id'  => $checklist->id,
        'start_date'               => now()->toDateString(),
        'status'                   => 'in_progress',
    ]);
    $checklist->load('tasks');
    foreach ($checklist->tasks as $task) {
        OnboardingProgress::create([
            'tenant_id'               => test()->tenant->id,
            'employee_onboarding_id'  => $onboarding->id,
            'onboarding_task_id'      => $task->id,
            'status'                  => 'pending',
        ]);
    }
    $progress = $onboarding->progress()->first();
    $this->post("/hr/employee-onboardings/{$onboarding->id}/tasks/{$progress->id}/complete", [
        'notes' => 'Done',
    ])->assertRedirect();
    expect($progress->fresh()->status)->toBe('completed');
});

it('admin can skip an onboarding task', function () {
    $employee  = makeOnboardEmployee();
    $checklist = makeOnboardChecklist(1);
    $onboarding = EmployeeOnboarding::create([
        'tenant_id'                => test()->tenant->id,
        'employee_id'              => $employee->id,
        'onboarding_checklist_id'  => $checklist->id,
        'start_date'               => now()->toDateString(),
        'status'                   => 'in_progress',
    ]);
    $task = $checklist->tasks()->first();
    $progress = OnboardingProgress::create([
        'tenant_id'               => test()->tenant->id,
        'employee_onboarding_id'  => $onboarding->id,
        'onboarding_task_id'      => $task->id,
        'status'                  => 'pending',
    ]);
    $this->post("/hr/employee-onboardings/{$onboarding->id}/tasks/{$progress->id}/skip")
        ->assertRedirect();
    expect($progress->fresh()->status)->toBe('skipped');
});

it('completion_percent calculates correctly', function () {
    $employee  = makeOnboardEmployee();
    $checklist = makeOnboardChecklist(4);
    $onboarding = EmployeeOnboarding::create([
        'tenant_id'                => test()->tenant->id,
        'employee_id'              => $employee->id,
        'onboarding_checklist_id'  => $checklist->id,
        'start_date'               => now()->toDateString(),
        'status'                   => 'in_progress',
    ]);
    $checklist->load('tasks');
    $tasks = $checklist->tasks;
    foreach ($tasks as $task) {
        OnboardingProgress::create([
            'tenant_id'               => test()->tenant->id,
            'employee_onboarding_id'  => $onboarding->id,
            'onboarding_task_id'      => $task->id,
            'status'                  => 'pending',
        ]);
    }
    $onboarding->progress()->take(2)->get()->each(fn($p) => $p->update(['status' => 'completed']));
    $onboarding->unsetRelation('progress');
    expect($onboarding->completion_percent)->toBe(50.0);
});

it('onboarding auto-completes when all tasks done', function () {
    $employee  = makeOnboardEmployee();
    $checklist = makeOnboardChecklist(1);
    $onboarding = EmployeeOnboarding::create([
        'tenant_id'                => test()->tenant->id,
        'employee_id'              => $employee->id,
        'onboarding_checklist_id'  => $checklist->id,
        'start_date'               => now()->toDateString(),
        'status'                   => 'in_progress',
    ]);
    $task = $checklist->tasks()->first();
    $progress = OnboardingProgress::create([
        'tenant_id'               => test()->tenant->id,
        'employee_onboarding_id'  => $onboarding->id,
        'onboarding_task_id'      => $task->id,
        'status'                  => 'pending',
    ]);
    $progress->complete(test()->admin);
    expect($onboarding->fresh()->status)->toBe('completed');
});

it('staff cannot delete an onboarding checklist', function () {
    $checklist = makeOnboardChecklist();
    $this->actingAs($this->staff)
        ->delete("/hr/onboarding-checklists/{$checklist->id}")
        ->assertStatus(403);
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeExit;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ExitCorp', 'slug' => 'exit-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeExitEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'Exit',
        'last_name'  => 'Worker-' . uniqid(),
        'email'      => 'exit.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->subYears(2)->toDateString(),
    ]);
}

function makeEmployeeExit(Employee $emp, array $attrs = []): EmployeeExit
{
    return EmployeeExit::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $emp->id,
        'exit_date'   => now()->addDays(30)->toDateString(),
        'exit_type'   => 'resignation',
        'status'      => 'pending',
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/hr/employee-exits')->assertRedirect('/login');
});

it('admin can list employee exits', function () {
    $this->get('/hr/employee-exits')->assertStatus(200);
});

it('staff with hr.view can list exits', function () {
    $this->actingAs($this->staff)
        ->get('/hr/employee-exits')
        ->assertStatus(200);
});

it('store creates an employee exit record', function () {
    $emp = makeExitEmployee();

    $this->post('/hr/employee-exits', [
        'employee_id' => $emp->id,
        'exit_date'   => now()->addDays(14)->toDateString(),
        'exit_type'   => 'resignation',
    ])->assertRedirect();

    $exit = EmployeeExit::where('employee_id', $emp->id)->first();
    expect($exit)->not->toBeNull();
    expect($exit->tenant_id)->toBe($this->tenant->id);
    expect($exit->exit_type)->toBe('resignation');
});

it('store validates required fields', function () {
    $this->postJson('/hr/employee-exits', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['employee_id', 'exit_date', 'exit_type']);
});

it('store validates exit_type is in allowed list', function () {
    $emp = makeExitEmployee();

    $this->postJson('/hr/employee-exits', [
        'employee_id' => $emp->id,
        'exit_date'   => now()->addDays(14)->toDateString(),
        'exit_type'   => 'invalid_type',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['exit_type']);
});

it('show displays exit record with employee', function () {
    $emp  = makeExitEmployee();
    $exit = makeEmployeeExit($emp);

    $this->get("/hr/employee-exits/{$exit->id}")->assertStatus(200);
});

it('markInProgress changes status to in_progress', function () {
    $emp  = makeExitEmployee();
    $exit = makeEmployeeExit($emp, ['status' => 'pending']);

    $this->post("/hr/employee-exits/{$exit->id}/in-progress")->assertRedirect();

    expect($exit->fresh()->status)->toBe('in_progress');
});

it('complete changes status to completed and sets processed_by', function () {
    $emp  = makeExitEmployee();
    $exit = makeEmployeeExit($emp, ['status' => 'in_progress']);

    $this->post("/hr/employee-exits/{$exit->id}/complete")->assertRedirect();

    $fresh = $exit->fresh();
    expect($fresh->status)->toBe('completed');
    expect($fresh->processed_by)->toBe($this->admin->id);
    expect($fresh->processed_at)->not->toBeNull();
});

it('destroy deletes the exit record', function () {
    $emp  = makeExitEmployee();
    $exit = makeEmployeeExit($emp);

    $this->delete("/hr/employee-exits/{$exit->id}")->assertRedirect('/hr/employee-exits');

    expect(EmployeeExit::find($exit->id))->toBeNull();
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeePositionChange;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'PCCorp', 'slug' => 'pc-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePCDepartment(): Department
{
    return Department::create(['tenant_id' => test()->tenant->id, 'name' => 'Dept-' . uniqid()]);
}

function makePCEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'PC',
        'last_name'  => 'Worker-' . uniqid(),
        'email'      => 'pc.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->subYear()->toDateString(),
    ]);
}

function makePositionChange(Employee $emp, array $attrs = []): EmployeePositionChange
{
    return EmployeePositionChange::create([
        'tenant_id'      => test()->tenant->id,
        'employee_id'    => $emp->id,
        'change_type'    => 'promotion',
        'effective_date' => now()->toDateString(),
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/hr/position-changes')->assertRedirect('/login');
});

it('admin can list position changes', function () {
    $this->get('/hr/position-changes')->assertStatus(200);
});

it('staff with hr.view can list position changes', function () {
    $this->actingAs($this->staff)
        ->get('/hr/position-changes')
        ->assertStatus(200);
});

it('store creates a promotion record', function () {
    $emp = makePCEmployee();

    $this->post('/hr/position-changes', [
        'employee_id'    => $emp->id,
        'change_type'    => 'promotion',
        'effective_date' => now()->toDateString(),
        'from_title'     => 'Junior Developer',
        'to_title'       => 'Senior Developer',
    ])->assertRedirect();

    $change = EmployeePositionChange::where('employee_id', $emp->id)->first();
    expect($change)->not->toBeNull();
    expect($change->tenant_id)->toBe($this->tenant->id);
    expect($change->change_type)->toBe('promotion');
    expect($change->from_title)->toBe('Junior Developer');
    expect($change->to_title)->toBe('Senior Developer');
});

it('store validates required fields', function () {
    $this->postJson('/hr/position-changes', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['employee_id', 'change_type', 'effective_date']);
});

it('store validates change_type is in allowed list', function () {
    $emp = makePCEmployee();

    $this->postJson('/hr/position-changes', [
        'employee_id'    => $emp->id,
        'change_type'    => 'invalid_type',
        'effective_date' => now()->toDateString(),
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['change_type']);
});

it('show displays position change with employee', function () {
    $emp    = makePCEmployee();
    $change = makePositionChange($emp);

    $this->get("/hr/position-changes/{$change->id}")->assertStatus(200);
});

it('approve sets approved_by and approved_at', function () {
    $emp    = makePCEmployee();
    $change = makePositionChange($emp);

    $this->post("/hr/position-changes/{$change->id}/approve")->assertRedirect();

    $fresh = $change->fresh();
    expect($fresh->approved_by)->toBe($this->admin->id);
    expect($fresh->approved_at)->not->toBeNull();
});

it('salary_change accessor returns correct difference', function () {
    $emp    = makePCEmployee();
    $change = makePositionChange($emp, [
        'change_type'  => 'salary_change',
        'from_salary'  => 3000.00,
        'to_salary'    => 3500.00,
    ]);

    expect($change->salary_change)->toBe(500.0);
});

it('destroy deletes the position change record', function () {
    $emp    = makePCEmployee();
    $change = makePositionChange($emp);

    $this->delete("/hr/position-changes/{$change->id}")->assertRedirect('/hr/position-changes');

    expect(EmployeePositionChange::find($change->id))->toBeNull();
});

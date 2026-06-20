<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co 2', 'slug' => 'test-co-2']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->dept = Department::create(['tenant_id' => $this->tenant->id, 'name' => 'Engineering']);
});

test('employee index renders', function () {
    $this->actingAs($this->admin)
        ->get('/hr/employees')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/Employees/Index'));
});

test('create employee generates code EMP-00001', function () {
    $this->actingAs($this->admin)
        ->post('/hr/employees', [
            'first_name'      => 'Alice',
            'last_name'       => 'Wonder',
            'employment_type' => 'full_time',
            'status'          => 'active',
            'salary_type'     => 'monthly',
            'salary_amount'   => 5000,
            'start_date'      => '2026-01-01',
            'department_id'   => $this->dept->id,
        ])
        ->assertRedirect();

    $employee = Employee::where('first_name', 'Alice')->first();
    expect($employee)->not->toBeNull();
    expect($employee->employee_number)->toMatch('/^EMP-\d{5}$/');
});

test('employee show page renders', function () {
    $employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Bob',
        'last_name'       => 'Show',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 4000,
        'start_date'      => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->get("/hr/employees/{$employee->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/Employees/Show'));
});

test('terminate sets status to terminated and sets end_date', function () {
    $employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Charlie',
        'last_name'       => 'Terminate',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 3000,
        'start_date'      => '2024-01-01',
    ]);

    $this->actingAs($this->admin)
        ->post("/hr/employees/{$employee->id}/terminate")
        ->assertRedirect();

    $employee->refresh();
    expect($employee->status)->toBe('terminated');
    expect($employee->end_date)->not->toBeNull();
});

test('cannot terminate already-terminated employee', function () {
    $employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Dave',
        'last_name'       => 'Terminated',
        'employment_type' => 'full_time',
        'status'          => 'terminated',
        'salary_type'     => 'monthly',
        'salary_amount'   => 2000,
        'start_date'      => '2020-01-01',
        'end_date'        => '2023-12-31',
    ]);

    $this->actingAs($this->admin)
        ->post("/hr/employees/{$employee->id}/terminate")
        ->assertSessionHasErrors('status');
});

test('staff can view employees but not create', function () {
    $staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $staff->assignRole('staff');

    $this->actingAs($staff)
        ->get('/hr/employees')
        ->assertStatus(200);

    $this->actingAs($staff)
        ->post('/hr/employees', [
            'first_name'      => 'Eve',
            'last_name'       => 'Staff',
            'employment_type' => 'full_time',
            'salary_type'     => 'monthly',
            'salary_amount'   => 2000,
            'start_date'      => now()->toDateString(),
        ])
        ->assertForbidden();
});

test('guest is redirected from employee pages', function () {
    $this->get('/hr/employees')->assertRedirect('/login');
});

test('employee can be updated', function () {
    $employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Update',
        'last_name'       => 'Me',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 3000,
        'start_date'      => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->put("/hr/employees/{$employee->id}", [
            'first_name'      => 'Updated',
            'last_name'       => 'Me',
            'employment_type' => 'full_time',
            'status'          => 'active',
            'salary_type'     => 'monthly',
            'salary_amount'   => 4000,
            'start_date'      => now()->toDateString(),
        ])
        ->assertRedirect();

    expect($employee->fresh()->first_name)->toBe('Updated');
});

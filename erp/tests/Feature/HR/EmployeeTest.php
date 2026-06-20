<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->dept = Department::create(['tenant_id' => $this->tenant->id, 'name' => 'Engineering']);
});

test('employees index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/hr/employees')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/Employees/Index'));
});

test('employee can be created', function () {
    $this->actingAs($this->admin)
        ->post('/hr/employees', [
            'first_name'      => 'John',
            'last_name'       => 'Doe',
            'employment_type' => 'full_time',
            'status'          => 'active',
            'salary_type'     => 'monthly',
            'salary_amount'   => 5000,
            'start_date'      => '2025-01-01',
            'department_id'   => $this->dept->id,
        ])
        ->assertRedirect();

    expect(Employee::where('first_name', 'John')->where('last_name', 'Doe')->exists())->toBeTrue();
});

test('employee full_name accessor works', function () {
    $employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Jane',
        'last_name'       => 'Smith',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 4000,
        'start_date'      => now()->toDateString(),
    ]);

    expect($employee->full_name)->toBe('Jane Smith');
});

test('active scope filters terminated employees', function () {
    Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Active',
        'last_name'       => 'Emp',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 3000,
        'start_date'      => now()->toDateString(),
    ]);

    Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Former',
        'last_name'       => 'Emp',
        'employment_type' => 'full_time',
        'status'          => 'terminated',
        'salary_type'     => 'monthly',
        'salary_amount'   => 3000,
        'start_date'      => now()->toDateString(),
    ]);

    $active = Employee::active()->get();
    expect($active)->toHaveCount(1);
    expect($active->first()->first_name)->toBe('Active');
});

test('employee show page renders', function () {
    $employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Alice',
        'last_name'       => 'Test',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 6000,
        'start_date'      => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->get("/hr/employees/{$employee->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/Employees/Show'));
});

test('employee can be updated', function () {
    $employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Bob',
        'last_name'       => 'Old',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 4000,
        'start_date'      => now()->toDateString(),
    ]);

    $this->actingAs($this->admin)
        ->put("/hr/employees/{$employee->id}", [
            'first_name'      => 'Bob',
            'last_name'       => 'New',
            'employment_type' => 'full_time',
            'status'          => 'active',
            'salary_type'     => 'monthly',
            'salary_amount'   => 4500,
            'start_date'      => now()->toDateString(),
        ])
        ->assertRedirect();

    expect($employee->fresh()->last_name)->toBe('New');
});

test('guests cannot access employee pages', function () {
    $this->get('/hr/employees')->assertRedirect('/login');
});

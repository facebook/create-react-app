<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveBalance;
use App\Modules\HR\Models\LeaveType;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Leave Co', 'slug' => 'leave-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);

    $this->leaveType = LeaveType::create([
        'tenant_id'   => $this->tenant->id,
        'name'        => 'Annual Leave',
        'code'        => 'AL',
        'is_paid'     => true,
        'is_active'   => true,
        'default_days' => 20,
    ]);

    $this->employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Jane',
        'last_name'       => 'Doe',
        'employee_number' => 'EMP-' . uniqid(),
        'email'           => 'jane-' . uniqid() . '@example.com',
        'position'        => 'Engineer',
        'status'          => 'active',
        'hire_date'       => now()->subYear()->toDateString(),
    ]);
});

test('can list leave types', function () {
    $this->withToken($this->token)
        ->getJson('/api/v1/leave/types')
        ->assertStatus(200)
        ->assertJsonPath('data.0.name', 'Annual Leave');
});

test('can get leave balance for an employee', function () {
    LeaveBalance::create([
        'tenant_id'      => $this->tenant->id,
        'employee_id'    => $this->employee->id,
        'leave_type_id'  => $this->leaveType->id,
        'year'           => now()->year,
        'allocated_days' => 20,
        'used_days'      => 5,
        'pending_days'   => 2,
    ]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/leave/employees/{$this->employee->id}/balance")
        ->assertStatus(200);

    $data = $response->json('data');
    expect($data['employee_id'])->toBe($this->employee->id);
    expect($data['balances'])->not->toBeEmpty();
    expect($data['balances'][0]['remaining_days'])->toBe(13);
});

test('can allocate leave for an employee', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/leave/allocate', [
            'employee_id'    => $this->employee->id,
            'leave_type_id'  => $this->leaveType->id,
            'year'           => now()->year,
            'allocated_days' => 15,
        ])
        ->assertStatus(201);

    expect(LeaveBalance::where('employee_id', $this->employee->id)->exists())->toBeTrue();
});

test('allocate validates employee and leave type exist', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/leave/allocate', [
            'employee_id'    => 99999,
            'leave_type_id'  => 99999,
            'year'           => now()->year,
            'allocated_days' => 20,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['employee_id', 'leave_type_id']);
});

test('re-allocating updates existing balance', function () {
    LeaveBalance::create([
        'tenant_id'      => $this->tenant->id,
        'employee_id'    => $this->employee->id,
        'leave_type_id'  => $this->leaveType->id,
        'year'           => now()->year,
        'allocated_days' => 10,
        'used_days'      => 0,
        'pending_days'   => 0,
    ]);

    $this->withToken($this->token)
        ->postJson('/api/v1/leave/allocate', [
            'employee_id'    => $this->employee->id,
            'leave_type_id'  => $this->leaveType->id,
            'year'           => now()->year,
            'allocated_days' => 25,
        ])
        ->assertStatus(201);

    $balance = LeaveBalance::where('employee_id', $this->employee->id)->first();
    expect($balance->allocated_days)->toBe(25.0);
    expect(LeaveBalance::where('employee_id', $this->employee->id)->count())->toBe(1);
});

test('team view returns all active employees with balances', function () {
    LeaveBalance::create([
        'tenant_id'      => $this->tenant->id,
        'employee_id'    => $this->employee->id,
        'leave_type_id'  => $this->leaveType->id,
        'year'           => now()->year,
        'allocated_days' => 20,
        'used_days'      => 3,
        'pending_days'   => 0,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/leave/team')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['year', 'employees']]);

    expect($response->json('data.year'))->toBe(now()->year);
});

test('balance endpoint respects year filter', function () {
    LeaveBalance::create([
        'tenant_id'      => $this->tenant->id,
        'employee_id'    => $this->employee->id,
        'leave_type_id'  => $this->leaveType->id,
        'year'           => 2023,
        'allocated_days' => 18,
        'used_days'      => 0,
        'pending_days'   => 0,
    ]);

    $response = $this->withToken($this->token)
        ->getJson("/api/v1/leave/employees/{$this->employee->id}/balance?year=2023")
        ->assertStatus(200);

    expect($response->json('data.year'))->toBe(2023);
    expect($response->json('data.balances.0.allocated_days'))->toBe(18);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/leave/types')->assertStatus(401);
});

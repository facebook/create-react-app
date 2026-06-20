<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveType;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\LeaveBalance;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Leave Corp', 'slug' => 'leave-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeLeaveEmployee(): Employee {
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'first_name' => 'Leave',
        'last_name'  => 'Taker',
        'email'      => 'leave_' . uniqid() . '@example.com',
        'status'     => 'active',
        'hire_date'  => now()->toDateString(),
    ]);
}

function makeLeaveType(string $name = 'Annual Leave'): LeaveType {
    return LeaveType::create([
        'tenant_id'    => test()->tenant->id,
        'name'         => $name,
        'code'         => 'AL',
        'default_days' => 20,
        'is_paid'      => true,
    ]);
}

function makeLeaveRequest(Employee $employee, LeaveType $leaveType, string $status = 'pending'): LeaveRequest {
    return LeaveRequest::create([
        'tenant_id'      => test()->tenant->id,
        'employee_id'    => $employee->id,
        'leave_type_id'  => $leaveType->id,
        'start_date'     => now()->addDays(5)->toDateString(),
        'end_date'       => now()->addDays(7)->toDateString(),
        'days_requested' => 3,
        'days'           => 3,
        'status'         => $status,
    ]);
}

it('admin can list leave types', function () {
    $this->get('/hr/leave-types')->assertStatus(200);
});

it('admin can create a leave type', function () {
    $this->post('/hr/leave-types', [
        'name'         => 'Maternity Leave',
        'default_days' => 90,
        'is_paid'      => true,
    ])->assertRedirect();
    expect(LeaveType::where('name', 'Maternity Leave')->exists())->toBeTrue();
});

it('admin can list leave requests', function () {
    $this->get('/hr/leave-requests')->assertStatus(200);
});

it('admin can create a leave request with pending balance update', function () {
    $employee  = makeLeaveEmployee();
    $leaveType = makeLeaveType();
    $this->post('/hr/leave-requests', [
        'employee_id'    => $employee->id,
        'leave_type_id'  => $leaveType->id,
        'start_date'     => now()->addDays(10)->toDateString(),
        'end_date'       => now()->addDays(12)->toDateString(),
        'days_requested' => 3,
    ])->assertRedirect();
    $request = LeaveRequest::where('employee_id', $employee->id)->first();
    expect($request)->not->toBeNull();
    expect($request->status)->toBe('pending');
    // Balance should have pending_days updated
    $balance = LeaveBalance::where('employee_id', $employee->id)
        ->where('leave_type_id', $leaveType->id)->first();
    expect($balance?->pending_days)->toBe(3.0);
});

it('admin can approve a leave request', function () {
    $employee  = makeLeaveEmployee();
    $leaveType = makeLeaveType();
    $request   = makeLeaveRequest($employee, $leaveType);
    LeaveBalance::create([
        'tenant_id'      => test()->tenant->id,
        'employee_id'    => $employee->id,
        'leave_type_id'  => $leaveType->id,
        'year'           => now()->year,
        'allocated_days' => 20,
        'used_days'      => 0,
        'pending_days'   => 3,
    ]);
    $this->post("/hr/leave-requests/{$request->id}/approve")->assertRedirect();
    expect($request->fresh()->status)->toBe('approved');
});

it('admin can reject a leave request', function () {
    $employee  = makeLeaveEmployee();
    $leaveType = makeLeaveType();
    $request   = makeLeaveRequest($employee, $leaveType);
    $this->post("/hr/leave-requests/{$request->id}/reject", [
        'rejection_reason' => 'Insufficient coverage',
    ])->assertRedirect();
    expect($request->fresh()->status)->toBe('rejected');
    expect($request->fresh()->rejection_reason)->toBe('Insufficient coverage');
});

it('remaining_days accessor calculates correctly', function () {
    $employee  = makeLeaveEmployee();
    $leaveType = makeLeaveType();
    $balance   = LeaveBalance::create([
        'tenant_id'      => test()->tenant->id,
        'employee_id'    => $employee->id,
        'leave_type_id'  => $leaveType->id,
        'year'           => now()->year,
        'allocated_days' => 20,
        'used_days'      => 5,
        'pending_days'   => 3,
    ]);
    expect($balance->remaining_days)->toBe(12.0);
});

it('admin can view a leave request', function () {
    $employee  = makeLeaveEmployee();
    $leaveType = makeLeaveType();
    $request   = makeLeaveRequest($employee, $leaveType);
    $this->get("/hr/leave-requests/{$request->id}")->assertStatus(200);
});

it('admin can view leave balances', function () {
    $this->get('/hr/leave-balances')->assertStatus(200);
});

it('staff cannot delete a leave type', function () {
    $leaveType = makeLeaveType('Sick Leave');
    $this->actingAs($this->staff)
        ->delete("/hr/leave-types/{$leaveType->id}")
        ->assertStatus(403);
});

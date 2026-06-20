<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\LeaveType;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant   = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Test',
        'last_name'       => 'Employee',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 3000,
        'start_date'      => now()->toDateString(),
    ]);
    $this->leaveType = LeaveType::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Annual Leave',
        'days_per_year' => 20,
        'is_paid'       => true,
    ]);
});

test('leave index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/hr/leave')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/Leave/Index'));
});

test('leave request can be submitted', function () {
    $this->actingAs($this->admin)
        ->post('/hr/leave', [
            'employee_id'   => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'start_date'    => now()->addDays(5)->toDateString(),
            'end_date'      => now()->addDays(9)->toDateString(),
            'days'          => 5,
        ])
        ->assertRedirect();

    expect(LeaveRequest::where('employee_id', $this->employee->id)->exists())->toBeTrue();
});

test('leave request starts as pending', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(1)->toDateString(),
        'end_date'      => now()->addDays(3)->toDateString(),
        'days'          => 3,
    ]);

    expect($req->status)->toBe('pending');
});

test('leave request can be approved', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(1)->toDateString(),
        'end_date'      => now()->addDays(3)->toDateString(),
        'days'          => 3,
    ]);

    $req->approve($this->admin);

    expect($req->fresh()->status)->toBe('approved');
    expect($req->fresh()->reviewed_by)->toBe($this->admin->id);
});

test('leave request can be rejected', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(1)->toDateString(),
        'end_date'      => now()->addDays(3)->toDateString(),
        'days'          => 3,
    ]);

    $req->reject($this->admin);

    expect($req->fresh()->status)->toBe('rejected');
});

test('cannot approve an already approved request', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(1)->toDateString(),
        'end_date'      => now()->addDays(2)->toDateString(),
        'days'          => 2,
        'status'        => 'approved',
    ]);

    expect(fn () => $req->approve($this->admin))->toThrow(\DomainException::class);
});

test('approve endpoint changes status via http', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(5)->toDateString(),
        'end_date'      => now()->addDays(6)->toDateString(),
        'days'          => 2,
    ]);

    $this->actingAs($this->admin)
        ->patch("/hr/leave/{$req->id}/approve")
        ->assertRedirect();

    expect($req->fresh()->status)->toBe('approved');
});

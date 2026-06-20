<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\LeaveType;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant   = Tenant::create(['name' => 'Leave Co', 'slug' => 'leave-co']);
    $this->admin    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Leave',
        'last_name'       => 'Tester',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 3000,
        'start_date'      => now()->toDateString(),
    ]);
    $this->leaveType = LeaveType::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Annual',
        'days_per_year' => 20,
        'is_paid'       => true,
    ]);
});

test('leave requests index renders', function () {
    $this->actingAs($this->admin)
        ->get('/hr/leave-requests')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/LeaveRequests/Index'));
});

test('leave request can be created via new route', function () {
    $this->actingAs($this->admin)
        ->post('/hr/leave-requests', [
            'employee_id'   => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'start_date'    => now()->addDays(5)->toDateString(),
            'end_date'      => now()->addDays(9)->toDateString(),
        ])
        ->assertRedirect();

    expect(LeaveRequest::where('employee_id', $this->employee->id)->exists())->toBeTrue();
});

test('leave request show page renders', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(1)->toDateString(),
        'end_date'      => now()->addDays(3)->toDateString(),
        'days'          => 3,
    ]);

    $this->actingAs($this->admin)
        ->get("/hr/leave-requests/{$req->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/LeaveRequests/Show'));
});

test('approve via new route changes status to approved', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(1)->toDateString(),
        'end_date'      => now()->addDays(3)->toDateString(),
        'days'          => 3,
    ]);

    $this->actingAs($this->admin)
        ->post("/hr/leave-requests/{$req->id}/approve")
        ->assertRedirect();

    $req->refresh();
    expect($req->status)->toBe('approved');
    expect($req->reviewed_by)->toBe($this->admin->id);
});

test('reject via new route changes status to rejected', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(1)->toDateString(),
        'end_date'      => now()->addDays(2)->toDateString(),
        'days'          => 2,
    ]);

    $this->actingAs($this->admin)
        ->post("/hr/leave-requests/{$req->id}/reject")
        ->assertRedirect();

    expect($req->fresh()->status)->toBe('rejected');
});

test('cannot approve already-approved request via HTTP', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(1)->toDateString(),
        'end_date'      => now()->addDays(2)->toDateString(),
        'days'          => 2,
        'status'        => 'approved',
    ]);

    $this->actingAs($this->admin)
        ->post("/hr/leave-requests/{$req->id}/approve")
        ->assertSessionHasErrors('status');
});

test('days accessor returns correct count', function () {
    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => '2026-06-01',
        'end_date'      => '2026-06-05',
        'days'          => 5,
    ]);

    expect($req->days)->toBe(5);
});

test('staff can view leave requests but not approve', function () {
    $staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $staff->assignRole('staff');

    $req = LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date'    => now()->addDays(1)->toDateString(),
        'end_date'      => now()->addDays(2)->toDateString(),
        'days'          => 2,
    ]);

    // Staff can view
    $this->actingAs($staff)
        ->get('/hr/leave-requests')
        ->assertStatus(200);

    // Staff cannot approve (no hr.update)
    $this->actingAs($staff)
        ->post("/hr/leave-requests/{$req->id}/approve")
        ->assertForbidden();
});

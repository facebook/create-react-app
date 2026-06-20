<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeLoan;
use App\Modules\HR\Models\LoanRepayment;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Loan Co', 'slug' => 'loan-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeLoanEmployee(): Employee
{
    $dept = Department::create(['tenant_id' => test()->tenant->id, 'name' => 'Finance Dept']);
    return Employee::create([
        'tenant_id'     => test()->tenant->id,
        'first_name'    => 'Loan',
        'last_name'     => 'Employee',
        'email'         => 'loan@example.com',
        'department_id' => $dept->id,
        'start_date'    => now()->toDateString(),
        'salary_amount' => 50000,
        'status'        => 'active',
    ]);
}

it('admin can list employee loans', function () {
    $this->get('/hr/employee-loans')->assertStatus(200);
});

it('admin can create an employee loan', function () {
    $emp = makeLoanEmployee();
    $this->post('/hr/employee-loans', [
        'employee_id' => $emp->id,
        'type'        => 'loan',
        'amount'      => 5000,
    ])->assertRedirect();
    expect(EmployeeLoan::where('employee_id', $emp->id)->exists())->toBeTrue();
});

it('loan outstanding_balance equals amount on creation', function () {
    $emp = makeLoanEmployee();
    $this->post('/hr/employee-loans', [
        'employee_id' => $emp->id,
        'type'        => 'advance',
        'amount'      => 1000,
    ]);
    $loan = EmployeeLoan::where('employee_id', $emp->id)->first();
    expect((float)$loan->outstanding_balance)->toBe(1000.0);
});

it('admin can approve a loan', function () {
    $emp = makeLoanEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => test()->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 2000,
        'outstanding_balance' => 2000,
        'status'              => 'pending',
    ]);
    $this->post("/hr/employee-loans/{$loan->id}/approve");
    expect($loan->fresh()->status)->toBe('active');
    expect($loan->fresh()->approved_by)->toBe(test()->admin->id);
});

it('admin can cancel a loan', function () {
    $emp = makeLoanEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => test()->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 2000,
        'outstanding_balance' => 2000,
        'status'              => 'pending',
    ]);
    $this->post("/hr/employee-loans/{$loan->id}/cancel");
    expect($loan->fresh()->status)->toBe('cancelled');
});

it('admin can add repayment and balance decrements', function () {
    $emp = makeLoanEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => test()->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 1000,
        'outstanding_balance' => 1000,
        'status'              => 'active',
    ]);
    $this->post("/hr/employee-loans/{$loan->id}/repayments", [
        'amount'       => 300,
        'payment_date' => now()->toDateString(),
    ]);
    expect((float)$loan->fresh()->outstanding_balance)->toBe(700.0);
});

it('loan status becomes completed when fully repaid', function () {
    $emp = makeLoanEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => test()->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'advance',
        'amount'              => 500,
        'outstanding_balance' => 500,
        'status'              => 'active',
    ]);
    $this->post("/hr/employee-loans/{$loan->id}/repayments", [
        'amount'       => 500,
        'payment_date' => now()->toDateString(),
    ]);
    expect($loan->fresh()->status)->toBe('completed');
});

it('total_repaid accessor sums repayments', function () {
    $emp = makeLoanEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => test()->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 1000,
        'outstanding_balance' => 600,
        'status'              => 'active',
    ]);
    $loan->repayments()->createMany([
        ['tenant_id' => test()->tenant->id, 'amount' => 200, 'payment_date' => now()->toDateString()],
        ['tenant_id' => test()->tenant->id, 'amount' => 200, 'payment_date' => now()->toDateString()],
    ]);
    $loan->load('repayments');
    expect((float)$loan->total_repaid)->toBe(400.0);
});

it('is_fully_repaid returns true when balance is zero', function () {
    $emp = makeLoanEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => test()->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 1000,
        'outstanding_balance' => 0,
        'status'              => 'completed',
    ]);
    expect($loan->is_fully_repaid)->toBeTrue();
});

it('staff cannot delete loan', function () {
    $emp = makeLoanEmployee();
    $loan = EmployeeLoan::create([
        'tenant_id'           => test()->tenant->id,
        'employee_id'         => $emp->id,
        'type'                => 'loan',
        'amount'              => 1000,
        'outstanding_balance' => 1000,
        'status'              => 'pending',
    ]);
    $this->actingAs($this->staff)
        ->delete("/hr/employee-loans/{$loan->id}")
        ->assertStatus(403);
});

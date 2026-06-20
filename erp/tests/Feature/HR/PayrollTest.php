<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\HR\Models\Payslip;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Payroll Phase73 Co', 'slug' => 'payroll-phase73-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
});

function makePayrollRun(string $status = 'draft'): PayrollRun
{
    return PayrollRun::create([
        'tenant_id'    => test()->tenant->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end'   => now()->endOfMonth()->toDateString(),
        'run_date'     => now()->toDateString(),
        'status'       => $status,
    ]);
}

// Test 1: admin can list payroll runs
test('admin can list payroll runs', function () {
    $this->get('/hr/payroll')
        ->assertStatus(200);
});

// Test 2: admin can create a payroll run
test('admin can create a payroll run', function () {
    $this->post('/hr/payroll', [
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end'   => now()->endOfMonth()->toDateString(),
        'run_date'     => now()->toDateString(),
    ])->assertRedirect();

    expect(
        PayrollRun::where('tenant_id', $this->tenant->id)->exists()
    )->toBeTrue();
});

// Test 3: store requires period_start, period_end, run_date
test('store requires period_start, period_end, run_date', function () {
    $this->postJson('/hr/payroll', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['period_start', 'period_end', 'run_date']);
});

// Test 4: admin can view a payroll run
test('admin can view a payroll run', function () {
    $run = makePayrollRun();

    $this->get("/hr/payroll/{$run->id}")
        ->assertStatus(200);
});

// Test 5: generate payslips creates payslips for active employees
test('generate payslips creates payslips for active employees', function () {
    \App\Modules\HR\Models\Employee::create([
        'tenant_id'    => $this->tenant->id,
        'first_name'   => 'Emp',
        'last_name'    => '1',
        'email'        => 'emp1@test.com',
        'start_date'   => now()->toDateString(),
        'salary_amount' => 60000,
        'status'       => 'active',
    ]);

    \App\Modules\HR\Models\Employee::create([
        'tenant_id'    => $this->tenant->id,
        'first_name'   => 'Emp',
        'last_name'    => '2',
        'email'        => 'emp2@test.com',
        'start_date'   => now()->toDateString(),
        'salary_amount' => 60000,
        'status'       => 'active',
    ]);

    $run = makePayrollRun();

    $this->post("/hr/payroll/{$run->id}/generate")
        ->assertRedirect();

    expect(Payslip::where('payroll_run_id', $run->id)->count())->toBe(2);
});

// Test 6: recalculateTotals updates run totals
test('recalculateTotals updates run totals', function () {
    \App\Modules\HR\Models\Employee::create([
        'tenant_id'    => $this->tenant->id,
        'first_name'   => 'Totals',
        'last_name'    => 'Worker',
        'email'        => 'totals@test.com',
        'start_date'   => now()->toDateString(),
        'salary_amount' => 60000,
        'status'       => 'active',
    ]);

    $run = makePayrollRun();
    $run->generatePayslips();
    $run->recalculateTotals();
    $run->refresh();

    expect((float) $run->total_gross)->toBeGreaterThan(0);
    expect((float) $run->total_net)->toBeGreaterThan(0);
});

// Test 7: admin can approve a payroll run
test('admin can approve a payroll run', function () {
    $run = makePayrollRun();

    $this->post("/hr/payroll/{$run->id}/approve")
        ->assertRedirect();

    $run->refresh();
    expect($run->status)->toBe('approved');
    expect($run->approved_by)->toBe($this->admin->id);
});

// Test 8: admin can mark a run as paid
test('admin can mark a run as paid', function () {
    $run = makePayrollRun('approved');

    $this->post("/hr/payroll/{$run->id}/mark-paid")
        ->assertRedirect();

    expect($run->fresh()->status)->toBe('paid');
});

// Test 9: effective_tax_rate accessor is correct
test('effective_tax_rate accessor is correct', function () {
    $run = makePayrollRun();
    $employee = \App\Modules\HR\Models\Employee::create([
        'tenant_id'    => $this->tenant->id,
        'first_name'   => 'Tax',
        'last_name'    => 'Test',
        'email'        => 'tax@test.com',
        'start_date'   => now()->toDateString(),
        'salary_amount' => 100,
        'status'       => 'active',
    ]);

    $payslip = Payslip::create([
        'tenant_id'        => $this->tenant->id,
        'payroll_run_id'   => $run->id,
        'employee_id'      => $employee->id,
        'gross_amount'     => 100,
        'tax_amount'       => 10,
        'total_deductions' => 10,
        'net_amount'       => 90,
    ]);

    expect($payslip->effective_tax_rate)->toBe(10.0);
});

// Test 10: staff cannot delete a payroll run
test('staff cannot delete a payroll run', function () {
    $run = makePayrollRun();

    $this->actingAs($this->staff)
        ->delete("/hr/payroll/{$run->id}")
        ->assertStatus(403);
});

<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\HR\Models\Payslip;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Payslip PDF Co', 'slug' => 'payslip-pdf-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePdfPayrollRun(): PayrollRun
{
    return PayrollRun::create([
        'tenant_id'    => test()->tenant->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end'   => now()->endOfMonth()->toDateString(),
        'run_date'     => now()->toDateString(),
        'status'       => 'draft',
    ]);
}

function makePdfEmployee(): Employee
{
    return Employee::create([
        'tenant_id'       => test()->tenant->id,
        'first_name'      => 'Alice',
        'last_name'       => 'Payslip',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 5000,
        'start_date'      => now()->toDateString(),
    ]);
}

function makePdfPayslip(?PayrollRun $run = null, ?Employee $emp = null): Payslip
{
    $run ??= makePdfPayrollRun();
    $emp ??= makePdfEmployee();

    return Payslip::create([
        'tenant_id'        => test()->tenant->id,
        'payroll_run_id'   => $run->id,
        'employee_id'      => $emp->id,
        'gross_amount'     => '5000.00',
        'total_deductions' => '500.00',
        'net_amount'       => '4500.00',
        'tax_amount'       => '500.00',
    ]);
}

// Test 1: PDF endpoint returns 200 with pdf content-type
test('payslip pdf endpoint returns pdf response', function () {
    $payslip = makePdfPayslip();

    $response = $this->get("/hr/payslips/{$payslip->id}/pdf");

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});

// Test 2: PDF filename includes employee name
test('payslip pdf content-disposition includes employee name', function () {
    $payslip = makePdfPayslip();

    $response = $this->get("/hr/payslips/{$payslip->id}/pdf");

    $response->assertStatus(200);
    $header = $response->headers->get('Content-Disposition');
    expect($header)->toContain('payslip-payslip-alice');
});

// Test 3: PDF response body is non-empty
test('payslip pdf response has non-empty body', function () {
    $payslip = makePdfPayslip();

    $response = $this->get("/hr/payslips/{$payslip->id}/pdf");

    $response->assertStatus(200);
    expect(strlen($response->getContent()))->toBeGreaterThan(100);
});

// Test 4: Unauthenticated user is redirected
test('unauthenticated user cannot access payslip pdf', function () {
    $payslip = makePdfPayslip();
    auth()->logout();

    $this->get("/hr/payslips/{$payslip->id}/pdf")
        ->assertRedirect('/login');
});

// Test 5: Show page renders with correct payslip data
test('payslip show page renders with payslip data', function () {
    $payslip = makePdfPayslip();

    $this->get("/hr/payslips/{$payslip->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('HR/Payslips/Show')
            ->has('payslip')
        );
});

// Test 6: Payroll run payslips index renders
test('payroll run payslips index renders', function () {
    $run     = makePdfPayrollRun();
    makePdfPayslip($run);

    $this->get("/hr/payroll-runs/{$run->id}/payslips")
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('HR/Payslips/Index')
            ->has('payslips')
        );
});

// Test 7: PDF content-disposition is inline
test('payslip pdf is served inline', function () {
    $payslip = makePdfPayslip();

    $response = $this->get("/hr/payslips/{$payslip->id}/pdf");

    $response->assertStatus(200);
    $disposition = $response->headers->get('Content-Disposition');
    expect($disposition)->toContain('inline');
});

// Test 8: non-existent payslip returns 404
test('non-existent payslip pdf returns 404', function () {
    $this->get('/hr/payslips/99999/pdf')
        ->assertStatus(404);
});

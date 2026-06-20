<?php
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\HR\Models\Payslip;
use App\Modules\HR\Models\SalaryRule;
use App\Modules\HR\Models\SalaryStructure;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Payroll Co', 'slug' => 'payroll-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

function makeStructure(): SalaryStructure {
    return SalaryStructure::create(['tenant_id' => test()->tenant->id, 'name' => 'Standard', 'code' => 'STD_' . uniqid(), 'is_active' => true]);
}

function makeSalaryEmployee(float $salary = 5000): Employee {
    $dept = Department::create(['tenant_id' => test()->tenant->id, 'name' => 'Eng ' . uniqid()]);
    return Employee::create([
        'tenant_id' => test()->tenant->id, 'first_name' => 'John', 'last_name' => 'Doe',
        'email' => 'john' . uniqid() . '@example.com', 'status' => 'active',
        'salary_amount' => $salary, 'salary_type' => 'monthly',
        'department_id' => $dept->id, 'hire_date' => now()->toDateString(),
    ]);
}

it('salary structures index returns 200', function () { $this->get('/hr/salary-structures')->assertStatus(200); });

it('can create a salary structure', function () {
    $code = 'STD_PKG_' . uniqid();
    $this->post('/hr/salary-structures', ['name' => 'Standard Package', 'code' => $code])->assertRedirect();
    expect(SalaryStructure::where('code', $code)->exists())->toBeTrue();
});

it('can view a salary structure', function () {
    $s = makeStructure();
    $this->get("/hr/salary-structures/{$s->id}")->assertStatus(200);
});

it('can add a rule to a structure', function () {
    $s = makeStructure();
    $this->post("/hr/salary-structures/{$s->id}/rules", ['name' => 'Basic', 'code' => 'BASIC', 'category' => 'earnings', 'sequence' => 10, 'amount_type' => 'fixed', 'amount' => 5000])->assertRedirect();
    expect(SalaryRule::where('structure_id', $s->id)->where('code', 'BASIC')->exists())->toBeTrue();
});

it('fixed rule computes correct amount', function () {
    $s = makeStructure();
    SalaryRule::create(['tenant_id' => test()->tenant->id, 'structure_id' => $s->id, 'name' => 'Basic', 'code' => 'BASIC', 'category' => 'earnings', 'sequence' => 10, 'amount_type' => 'fixed', 'amount' => 4000]);
    $emp = makeSalaryEmployee(4000);
    $lines = $s->compute($emp);
    expect(collect($lines)->firstWhere('code', 'BASIC')['amount'])->toBe(4000.0);
});

it('percentage_of_basic rule computes correctly', function () {
    $s = makeStructure();
    SalaryRule::create(['tenant_id' => test()->tenant->id, 'structure_id' => $s->id, 'name' => 'Tax', 'code' => 'TAX', 'category' => 'deductions', 'sequence' => 20, 'amount_type' => 'percentage_of_basic', 'percentage' => 10]);
    $emp = makeSalaryEmployee(5000);
    expect(collect($s->compute($emp))->firstWhere('code', 'TAX')['amount'])->toBe(500.0);
});

it('percentage_of_rule computes from base rule', function () {
    $s = makeStructure();
    SalaryRule::create(['tenant_id' => test()->tenant->id, 'structure_id' => $s->id, 'name' => 'Basic', 'code' => 'BASIC', 'category' => 'earnings', 'sequence' => 10, 'amount_type' => 'fixed', 'amount' => 4000]);
    SalaryRule::create(['tenant_id' => test()->tenant->id, 'structure_id' => $s->id, 'name' => 'Housing', 'code' => 'HOUSING', 'category' => 'earnings', 'sequence' => 20, 'amount_type' => 'percentage_of_rule', 'percentage' => 25, 'base_rule_code' => 'BASIC']);
    $emp = makeSalaryEmployee(4000);
    expect(collect($s->compute($emp))->firstWhere('code', 'HOUSING')['amount'])->toBe(1000.0);
});

it('generatePayslips uses salary structure when assigned', function () {
    $s = makeStructure();
    SalaryRule::create(['tenant_id' => test()->tenant->id, 'structure_id' => $s->id, 'name' => 'Basic', 'code' => 'BASIC', 'category' => 'earnings', 'sequence' => 10, 'amount_type' => 'fixed', 'amount' => 6000]);
    SalaryRule::create(['tenant_id' => test()->tenant->id, 'structure_id' => $s->id, 'name' => 'Tax', 'code' => 'TAX', 'category' => 'deductions', 'sequence' => 20, 'amount_type' => 'percentage_of_basic', 'percentage' => 10]);
    $emp = makeSalaryEmployee(6000);
    $emp->salary_structure_id = $s->id;
    $emp->save();
    $run = PayrollRun::create(['tenant_id' => test()->tenant->id, 'period_start' => '2026-01-01', 'period_end' => '2026-01-31', 'period_label' => 'Jan 2026', 'status' => 'draft', 'created_by' => test()->user->id]);
    expect($run->generatePayslips())->toBe(1);
    $payslip = Payslip::where('payroll_run_id', $run->id)->where('employee_id', $emp->id)->first();
    expect((float) $payslip->gross_amount)->toBe(6000.0);
    expect((float) $payslip->total_deductions)->toBe(600.0);
    expect((float) $payslip->net_amount)->toBe(5400.0);
});

it('payslip lines are created per rule', function () {
    $s = makeStructure();
    SalaryRule::create(['tenant_id' => test()->tenant->id, 'structure_id' => $s->id, 'name' => 'Basic', 'code' => 'BASIC', 'category' => 'earnings', 'sequence' => 10, 'amount_type' => 'fixed', 'amount' => 5000]);
    $emp = makeSalaryEmployee(5000);
    $emp->salary_structure_id = $s->id;
    $emp->save();
    $run = PayrollRun::create(['tenant_id' => test()->tenant->id, 'period_start' => '2026-02-01', 'period_end' => '2026-02-28', 'period_label' => 'Feb 2026', 'status' => 'draft', 'created_by' => test()->user->id]);
    $run->generatePayslips();
    $payslip = Payslip::where('payroll_run_id', $run->id)->first();
    expect($payslip->lines()->count())->toBe(1);
    expect((float) $payslip->lines()->first()->amount)->toBe(5000.0);
});

it('can delete a salary rule', function () {
    $s = makeStructure();
    $rule = SalaryRule::create(['tenant_id' => test()->tenant->id, 'structure_id' => $s->id, 'name' => 'Basic', 'code' => 'BASIC', 'category' => 'earnings', 'sequence' => 10, 'amount_type' => 'fixed', 'amount' => 5000]);
    $this->delete("/hr/salary-structures/{$s->id}/rules/{$rule->id}")->assertRedirect();
    expect(SalaryRule::find($rule->id))->toBeNull();
});

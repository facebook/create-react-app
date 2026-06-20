<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant   = Tenant::create(['name' => 'Payroll Co', 'slug' => 'payroll-co']);
    $this->admin    = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Payroll',
        'last_name'       => 'Worker',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 5000,
        'start_date'      => now()->toDateString(),
    ]);
});

test('payroll runs index renders', function () {
    $this->actingAs($this->admin)
        ->get('/hr/payroll-runs')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/PayrollRuns/Index'));
});

test('payroll run create page renders', function () {
    $this->actingAs($this->admin)
        ->get('/hr/payroll-runs/create')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/PayrollRuns/Create'));
});

test('payroll run can be created', function () {
    $this->actingAs($this->admin)
        ->post('/hr/payroll-runs', [
            'period_label' => 'June 2026',
            'period_start' => '2026-06-01',
            'period_end'   => '2026-06-30',
        ])
        ->assertRedirect();

    $run = PayrollRun::where('period_label', 'June 2026')->first();
    expect($run)->not->toBeNull();
    expect($run->status)->toBe('draft');
});

test('process computes totals from active employees salary', function () {
    $emp2 = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Second',
        'last_name'       => 'Worker',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 3000,
        'start_date'      => now()->toDateString(),
    ]);

    $run = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_label' => 'May 2026',
        'period_start' => '2026-05-01',
        'period_end'   => '2026-05-31',
    ]);

    $run->process();

    $run->refresh();
    expect($run->status)->toBe('processed');
    expect((float) $run->total_gross)->toBe(8000.0);  // 5000 + 3000
    expect((float) $run->total_net)->toBe(8000.0);    // 0 deductions
    expect($run->employee_count)->toBe(2);
});

test('cannot process already-processed run', function () {
    $run = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_label' => 'April 2026',
        'period_start' => '2026-04-01',
        'period_end'   => '2026-04-30',
        'status'       => 'processed',
    ]);

    expect(fn () => $run->process())->toThrow(\DomainException::class);
});

test('delete only works on draft payroll runs', function () {
    $draftRun = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_start' => '2026-07-01',
        'period_end'   => '2026-07-31',
        'status'       => 'draft',
    ]);

    $processedRun = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_start' => '2026-08-01',
        'period_end'   => '2026-08-31',
        'status'       => 'processed',
    ]);

    // Can delete draft
    $this->actingAs($this->admin)
        ->delete("/hr/payroll-runs/{$draftRun->id}")
        ->assertRedirect();

    expect(PayrollRun::find($draftRun->id))->toBeNull();

    // Cannot delete processed
    $this->actingAs($this->admin)
        ->delete("/hr/payroll-runs/{$processedRun->id}")
        ->assertForbidden();
});

test('payroll run show page renders', function () {
    $run = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_label' => 'March 2026',
        'period_start' => '2026-03-01',
        'period_end'   => '2026-03-31',
    ]);

    $this->actingAs($this->admin)
        ->get("/hr/payroll-runs/{$run->id}")
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('HR/PayrollRuns/Show'));
});

test('staff cannot create payroll runs', function () {
    $staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $staff->assignRole('staff');

    $this->actingAs($staff)
        ->post('/hr/payroll-runs', [
            'period_start' => '2026-09-01',
            'period_end'   => '2026-09-30',
        ])
        ->assertForbidden();
});

test('process via http route sets status to processed', function () {
    $run = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_label' => 'Feb 2026',
        'period_start' => '2026-02-01',
        'period_end'   => '2026-02-28',
    ]);

    $this->actingAs($this->admin)
        ->post("/hr/payroll-runs/{$run->id}/process")
        ->assertRedirect();

    expect($run->fresh()->status)->toBe('processed');
});

test('already-processed run returns error via http', function () {
    $run = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_start' => '2026-01-01',
        'period_end'   => '2026-01-31',
        'status'       => 'processed',
    ]);

    $this->actingAs($this->admin)
        ->post("/hr/payroll-runs/{$run->id}/process")
        ->assertSessionHasErrors('status');
});

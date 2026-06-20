<?php

use App\Jobs\ProcessPayrollRun;
use App\Jobs\RecalculateLeadScores;
use App\Jobs\SendEmailSequenceStep;
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\HR\Models\Payslip;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Queue Test Co', 'slug' => 'queue-test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

// Test 1: Queue monitor page renders
test('queue monitor page renders', function () {
    $this->get('/queue/monitor')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Queue/Monitor')
            ->has('pending')
            ->has('failed')
            ->has('byQueue')
            ->has('recentFailed')
        );
});

// Test 2: ProcessPayrollRun job has correct queue and properties
test('process payroll run job has correct queue name', function () {
    $job = new ProcessPayrollRun(42, $this->tenant->id);

    expect($job->queue)->toBe('payroll');
    expect($job->payrollRunId)->toBe(42);
    expect($job->tenantId)->toBe($this->tenant->id);
});

// Test 3: ProcessPayrollRun handle creates payslips
test('process payroll run handle creates payslips for employees', function () {
    $run = PayrollRun::create([
        'tenant_id'    => $this->tenant->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end'   => now()->endOfMonth()->toDateString(),
        'run_date'     => now()->toDateString(),
        'status'       => 'draft',
    ]);

    Employee::create([
        'tenant_id'       => $this->tenant->id,
        'first_name'      => 'Bob',
        'last_name'       => 'Queue',
        'employment_type' => 'full_time',
        'status'          => 'active',
        'salary_type'     => 'monthly',
        'salary_amount'   => 3000,
        'start_date'      => now()->toDateString(),
    ]);

    $job = new ProcessPayrollRun($run->id, $this->tenant->id);
    $job->handle();

    $run->refresh();
    expect($run->status)->toBe('completed');
    expect(Payslip::where('payroll_run_id', $run->id)->count())->toBe(1);
});

// Test 4: RecalculateLeadScores job has correct queue and tenantId
test('recalculate lead scores job has correct queue name', function () {
    $job = new RecalculateLeadScores($this->tenant->id);

    expect($job->queue)->toBe('default');
    expect($job->tenantId)->toBe($this->tenant->id);
});

// Test 5: SendEmailSequenceStep job has correct properties
test('send email sequence step job has correct properties', function () {
    $job = new SendEmailSequenceStep(5, 10);

    expect($job->queue)->toBe('email');
    expect($job->enrollmentId)->toBe(5);
    expect($job->stepId)->toBe(10);
    expect($job->tries)->toBe(3);
});

// Test 6: Unauthenticated user cannot access queue monitor
test('unauthenticated user cannot access queue monitor', function () {
    auth()->logout();

    $this->get('/queue/monitor')
        ->assertRedirect('/login');
});

// Test 7: Monitor shows pending job count
test('monitor shows correct pending count from jobs table', function () {
    // Insert a fake pending job
    DB::table('jobs')->insert([
        'queue'        => 'default',
        'payload'      => '{}',
        'attempts'     => 0,
        'available_at' => now()->timestamp,
        'created_at'   => now()->timestamp,
    ]);

    $this->get('/queue/monitor')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->where('pending', 1)
        );
});

// Test 8: Clear failed jobs deletes all failed jobs
test('clear failed jobs deletes all failed jobs', function () {
    DB::table('failed_jobs')->insert([
        'uuid'       => (string) Str::uuid(),
        'connection' => 'database',
        'queue'      => 'default',
        'payload'    => '{}',
        'exception'  => 'Test exception',
        'failed_at'  => now(),
    ]);

    $this->delete('/queue/failed')
        ->assertRedirect();

    expect(DB::table('failed_jobs')->count())->toBe(0);
});

// Test 9: Retry failed job removes it from failed_jobs
test('retry failed job removes it from failed jobs table', function () {
    $uuid = (string) Str::uuid();

    DB::table('failed_jobs')->insert([
        'uuid'       => $uuid,
        'connection' => 'database',
        'queue'      => 'default',
        'payload'    => '{}',
        'exception'  => 'Test exception',
        'failed_at'  => now(),
    ]);

    $this->post("/queue/failed/{$uuid}/retry")
        ->assertRedirect();

    expect(DB::table('failed_jobs')->where('uuid', $uuid)->exists())->toBeFalse();
});

// Test 10: ProcessPayrollRun handle does nothing when run not found
test('process payroll run handle does nothing when run not found', function () {
    $initialCount = Payslip::count();

    $job = new ProcessPayrollRun(99999, $this->tenant->id);
    $job->handle();

    expect(Payslip::count())->toBe($initialCount);
});

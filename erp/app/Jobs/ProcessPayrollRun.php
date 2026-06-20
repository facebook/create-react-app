<?php

namespace App\Jobs;

use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\HR\Models\Payslip;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPayrollRun implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $payrollRunId,
        public int $tenantId,
    ) {
        $this->queue = 'payroll';
    }

    public function handle(): void
    {
        $tenant = Tenant::find($this->tenantId);

        if (! $tenant) {
            return;
        }

        app()->instance('tenant', $tenant);

        $run = PayrollRun::find($this->payrollRunId);

        if (! $run) {
            return;
        }

        $run->update(['status' => 'processing']);

        $employees = Employee::where('tenant_id', $this->tenantId)->get();

        foreach ($employees as $employee) {
            $salary = $employee->salary_amount ?? 0;

            Payslip::create([
                'tenant_id'        => $this->tenantId,
                'payroll_run_id'   => $run->id,
                'employee_id'      => $employee->id,
                'gross_amount'     => $salary,
                'net_amount'       => $salary,
                'total_deductions' => 0,
                'tax_amount'       => 0,
            ]);
        }

        $run->update(['status' => 'completed']);
    }
}

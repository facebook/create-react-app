<?php

namespace App\Jobs;

use App\Modules\HR\Models\PayrollRun;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GeneratePayslipJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly PayrollRun $payrollRun) {}

    public function handle(): void
    {
        Log::info("Generating payslips for payroll run [{$this->payrollRun->id}] period: {$this->payrollRun->period_label}");
    }
}

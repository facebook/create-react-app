<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Payslip;
use App\Modules\HR\Models\PayrollRun;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Inertia\Inertia;

class PayslipController extends Controller
{
    public function index(PayrollRun $payrollRun): \Inertia\Response
    {
        $payslips = $payrollRun->payslips()
            ->with(['employee.department', 'lines'])
            ->get();

        return Inertia::render('HR/Payslips/Index', [
            'payrollRun' => $payrollRun,
            'payslips'   => $payslips,
        ]);
    }

    public function show(Payslip $payslip): \Inertia\Response
    {
        $payslip->load(['employee.department', 'payrollRun', 'lines']);

        return Inertia::render('HR/Payslips/Show', [
            'payslip' => $payslip,
        ]);
    }

    public function pdf(Payslip $payslip): Response
    {
        $payslip->load(['employee.department', 'payrollRun', 'lines']);

        $company = $this->resolveCompanyName();

        $pdf = Pdf::loadView('pdf.payslip', [
            'payslip' => $payslip,
            'company' => $company,
        ]);

        $employee = $payslip->employee;
        $name     = $employee ? strtolower($employee->last_name . '-' . $employee->first_name) : 'employee';
        $filename = "payslip-{$name}-{$payslip->id}.pdf";

        return response($pdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$filename}\"",
        ]);
    }

    public function downloadAll(PayrollRun $payrollRun): Response
    {
        $payrollRun->load(['payslips.employee', 'payslips.lines']);
        $company = $this->resolveCompanyName();

        $pdf = Pdf::loadView('pdf.payroll-run-payslips', [
            'payrollRun' => $payrollRun,
            'company'    => $company,
        ]);

        $filename = "payslips-{$payrollRun->id}.pdf";

        return response($pdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    private function resolveCompanyName(): string
    {
        try {
            return app('tenant')->name;
        } catch (\Throwable) {
            return config('app.name', 'ERP');
        }
    }
}

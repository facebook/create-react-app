<?php

namespace App\Listeners\HR;

use App\Events\HR\PayrollRunApproved;
use App\Jobs\GeneratePayslipJob;
use App\Mail\PayrollApprovedMail;
use App\Modules\Accounting\Models\JournalEntry;
use App\Modules\Accounting\Models\JournalEntryLine;
use Illuminate\Support\Facades\Mail;

class CreatePayrollJournalEntry
{
    public function handle(PayrollRunApproved $event): void
    {
        $payrollRun = $event->payrollRun;

        $entry = JournalEntry::create([
            'tenant_id'   => $payrollRun->tenant_id,
            'reference'   => 'PAYROLL-' . $payrollRun->period_label,
            'description' => 'Payroll journal entry for ' . $payrollRun->period_label,
            'entry_date'  => now()->toDateString(),
            'status'      => 'draft',
        ]);

        $entry->entry_number = $entry->generateEntryNumber();
        $entry->save();

        // Find or create placeholder accounts for salary expense and payable
        $expenseAccount  = $this->findOrCreateAccount($payrollRun->tenant_id, '6100', 'Salary Expense', 'expense', 'debit');
        $payableAccount  = $this->findOrCreateAccount($payrollRun->tenant_id, '2100', 'Salary Payable', 'liability', 'credit');

        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'account_id'       => $expenseAccount->id,
            'description'      => 'Salary Expense',
            'debit'            => $payrollRun->total_gross,
            'credit'           => 0,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'account_id'       => $payableAccount->id,
            'description'      => 'Salary Payable',
            'debit'            => 0,
            'credit'           => $payrollRun->total_net,
        ]);

        GeneratePayslipJob::dispatch($payrollRun);

        Mail::to('payroll@example.com')->queue(new PayrollApprovedMail($payrollRun));
    }

    private function findOrCreateAccount(int $tenantId, string $code, string $name, string $type, string $normalBalance): \App\Modules\Accounting\Models\Account
    {
        return \App\Modules\Accounting\Models\Account::firstOrCreate(
            ['tenant_id' => $tenantId, 'code' => $code],
            [
                'name'           => $name,
                'type'           => $type,
                'normal_balance' => $normalBalance,
                'is_active'      => true,
            ]
        );
    }
}

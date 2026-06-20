<?php

namespace App\Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounting\Models\Account;
use App\Modules\Accounting\Models\AccountingPeriod;
use App\Modules\Accounting\Models\JournalEntryLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AccountingReportController extends Controller
{
    public function trialBalance(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;
        $asOf     = $request->as_of ?? now()->toDateString();

        $accounts = Account::withoutGlobalScopes()
            ->where('chart_of_accounts.tenant_id', $tenantId)
            ->select('chart_of_accounts.*')
            ->selectRaw('COALESCE(SUM(accounting_journal_entry_lines.debit), 0) as total_debit')
            ->selectRaw('COALESCE(SUM(accounting_journal_entry_lines.credit), 0) as total_credit')
            ->leftJoin('accounting_journal_entry_lines', 'accounting_journal_entry_lines.account_id', '=', 'chart_of_accounts.id')
            ->leftJoin('accounting_journal_entries', function ($join) use ($asOf) {
                $join->on('accounting_journal_entries.id', '=', 'accounting_journal_entry_lines.journal_entry_id')
                    ->where('accounting_journal_entries.status', 'posted')
                    ->where('accounting_journal_entries.entry_date', '<=', $asOf);
            })
            ->groupBy('chart_of_accounts.id')
            ->havingRaw('total_debit != 0 OR total_credit != 0')
            ->orderBy('code')
            ->get();

        $totalDebits  = $accounts->sum('total_debit');
        $totalCredits = $accounts->sum('total_credit');
        $isBalanced   = abs($totalDebits - $totalCredits) < 0.01;

        return Inertia::render('Accounting/Reports/TrialBalance', [
            'accounts'     => $accounts,
            'totalDebits'  => $totalDebits,
            'totalCredits' => $totalCredits,
            'isBalanced'   => $isBalanced,
            'asOf'         => $asOf,
        ]);
    }

    public function balanceSheet(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;
        $asOf     = $request->as_of ?? now()->toDateString();

        $accounts = $this->getAccountBalances($tenantId, $asOf);

        $assets      = $accounts->where('type', 'asset');
        $liabilities = $accounts->where('type', 'liability');
        $equity      = $accounts->where('type', 'equity');

        $totalAssets      = $assets->sum(fn ($a) => $a->total_debit - $a->total_credit);
        $totalLiabilities = $liabilities->sum(fn ($a) => $a->total_credit - $a->total_debit);
        $totalEquity      = $equity->sum(fn ($a) => $a->total_credit - $a->total_debit);

        return Inertia::render('Accounting/Reports/BalanceSheet', [
            'assets'           => $assets->values(),
            'liabilities'      => $liabilities->values(),
            'equity'           => $equity->values(),
            'totalAssets'      => $totalAssets,
            'totalLiabilities' => $totalLiabilities,
            'totalEquity'      => $totalEquity,
            'asOf'             => $asOf,
        ]);
    }

    public function incomeStatement(Request $request): Response
    {
        $tenantId  = auth()->user()->tenant_id;
        $startDate = $request->start_date ?? now()->startOfYear()->toDateString();
        $endDate   = $request->end_date   ?? now()->toDateString();

        $accounts = Account::withoutGlobalScopes()
            ->where('chart_of_accounts.tenant_id', $tenantId)
            ->whereIn('chart_of_accounts.type', ['revenue', 'expense'])
            ->select('chart_of_accounts.*')
            ->selectRaw('COALESCE(SUM(accounting_journal_entry_lines.debit), 0) as total_debit')
            ->selectRaw('COALESCE(SUM(accounting_journal_entry_lines.credit), 0) as total_credit')
            ->leftJoin('accounting_journal_entry_lines', 'accounting_journal_entry_lines.account_id', '=', 'chart_of_accounts.id')
            ->leftJoin('accounting_journal_entries', function ($join) use ($startDate, $endDate) {
                $join->on('accounting_journal_entries.id', '=', 'accounting_journal_entry_lines.journal_entry_id')
                    ->where('accounting_journal_entries.status', 'posted')
                    ->whereBetween('accounting_journal_entries.entry_date', [$startDate, $endDate]);
            })
            ->groupBy('chart_of_accounts.id')
            ->orderBy('code')
            ->get();

        $revenue  = $accounts->where('type', 'revenue');
        $expenses = $accounts->where('type', 'expense');

        $totalRevenue  = $revenue->sum(fn ($a) => $a->total_credit - $a->total_debit);
        $totalExpenses = $expenses->sum(fn ($a) => $a->total_debit - $a->total_credit);
        $netIncome     = $totalRevenue - $totalExpenses;

        return Inertia::render('Accounting/Reports/IncomeStatement', [
            'revenue'       => $revenue->values(),
            'expenses'      => $expenses->values(),
            'totalRevenue'  => $totalRevenue,
            'totalExpenses' => $totalExpenses,
            'netIncome'     => $netIncome,
            'startDate'     => $startDate,
            'endDate'       => $endDate,
        ]);
    }

    public function generalLedger(Request $request, Account $account): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $lines = JournalEntryLine::with('journalEntry')
            ->where('accounting_journal_entry_lines.account_id', $account->id)
            ->whereHas('journalEntry', fn ($q) => $q->where('status', 'posted')
                ->where('tenant_id', $tenantId))
            ->join('accounting_journal_entries', 'accounting_journal_entries.id', '=', 'accounting_journal_entry_lines.journal_entry_id')
            ->orderBy('accounting_journal_entries.entry_date')
            ->orderBy('accounting_journal_entries.id')
            ->select('accounting_journal_entry_lines.*')
            ->get();

        // Compute running balance
        $runningBalance = 0.0;
        $linesWithBalance = $lines->map(function ($line) use (&$runningBalance, $account) {
            if ($account->isDebitNormal()) {
                $runningBalance += $line->debit - $line->credit;
            } else {
                $runningBalance += $line->credit - $line->debit;
            }
            return array_merge($line->toArray(), ['running_balance' => $runningBalance]);
        });

        $allAccounts = Account::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return Inertia::render('Accounting/Reports/GeneralLedger', [
            'account'     => $account,
            'lines'       => $linesWithBalance,
            'allAccounts' => $allAccounts,
        ]);
    }

    private function getAccountBalances(int $tenantId, string $asOf)
    {
        return Account::withoutGlobalScopes()
            ->where('chart_of_accounts.tenant_id', $tenantId)
            ->select('chart_of_accounts.*')
            ->selectRaw('COALESCE(SUM(accounting_journal_entry_lines.debit), 0) as total_debit')
            ->selectRaw('COALESCE(SUM(accounting_journal_entry_lines.credit), 0) as total_credit')
            ->leftJoin('accounting_journal_entry_lines', 'accounting_journal_entry_lines.account_id', '=', 'chart_of_accounts.id')
            ->leftJoin('accounting_journal_entries', function ($join) use ($asOf) {
                $join->on('accounting_journal_entries.id', '=', 'accounting_journal_entry_lines.journal_entry_id')
                    ->where('accounting_journal_entries.status', 'posted')
                    ->where('accounting_journal_entries.entry_date', '<=', $asOf);
            })
            ->groupBy('chart_of_accounts.id')
            ->orderBy('code')
            ->get();
    }
}

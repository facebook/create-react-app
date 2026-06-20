<?php

use App\Modules\Accounting\Http\Controllers\AccountController;
use App\Modules\Accounting\Http\Controllers\AccountingPeriodController;
use App\Modules\Accounting\Http\Controllers\AccountingReportController;
use App\Modules\Accounting\Http\Controllers\AutoPostingRuleController;
use App\Modules\Accounting\Http\Controllers\BankAccountController;
use App\Modules\Accounting\Http\Controllers\BankReconciliationController;
use App\Modules\Accounting\Http\Controllers\JournalEntryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('accounting')->name('accounting.')->group(function () {
    // Reports
    Route::get('reports/trial-balance',    [AccountingReportController::class, 'trialBalance'])->name('reports.trial-balance');
    Route::get('reports/balance-sheet',    [AccountingReportController::class, 'balanceSheet'])->name('reports.balance-sheet');
    Route::get('reports/income-statement', [AccountingReportController::class, 'incomeStatement'])->name('reports.income-statement');
    Route::get('reports/general-ledger/{account}', [AccountingReportController::class, 'generalLedger'])->name('reports.general-ledger');

    // Account actions BEFORE resource
    Route::post('accounts/seed-defaults', [AccountController::class, 'seedDefaults'])->name('accounts.seed-defaults');
    Route::resource('accounts', AccountController::class)->except(['show']);

    // Journal entry actions BEFORE resource
    Route::post('journal-entries/{journalEntry}/post',    [JournalEntryController::class, 'post'])->name('journal-entries.post');
    Route::post('journal-entries/{journalEntry}/reverse', [JournalEntryController::class, 'reverse'])->name('journal-entries.reverse');
    Route::resource('journal-entries', JournalEntryController::class)->except(['edit', 'update']);

    // Periods
    Route::post('periods/{period}/close', [AccountingPeriodController::class, 'close'])->name('periods.close');
    Route::resource('periods', AccountingPeriodController::class)->except(['show', 'edit', 'update']);

    // Bank Accounts
    Route::resource('bank-accounts', BankAccountController::class)->except(['show', 'create', 'edit']);

    // Reconciliation
    Route::get('bank-accounts/{bankAccount}/reconcile',                               [BankReconciliationController::class, 'index'])->name('bank-accounts.reconcile');
    Route::get('bank-accounts/{bankAccount}/transactions',                            [BankReconciliationController::class, 'transactions'])->name('bank-accounts.transactions');
    Route::post('bank-accounts/{bankAccount}/transactions',                           [BankReconciliationController::class, 'importTransaction'])->name('bank-accounts.transactions.import');
    Route::post('bank-accounts/{bankAccount}/transactions/{transaction}/reconcile',   [BankReconciliationController::class, 'reconcile'])->name('bank-accounts.transactions.reconcile');
    Route::post('bank-accounts/{bankAccount}/transactions/{transaction}/unreconcile', [BankReconciliationController::class, 'unreconcile'])->name('bank-accounts.transactions.unreconcile');

    // Auto-posting Rules
    Route::get('bank-accounts/{bankAccount}/rules',  [AutoPostingRuleController::class, 'index'])->name('bank-accounts.rules.index');
    Route::post('bank-accounts/{bankAccount}/rules', [AutoPostingRuleController::class, 'store'])->name('bank-accounts.rules.store');
    Route::delete('bank-accounts/{bankAccount}/rules/{rule}', [AutoPostingRuleController::class, 'destroy'])->name('bank-accounts.rules.destroy');
});

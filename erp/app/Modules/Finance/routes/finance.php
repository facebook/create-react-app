<?php

use App\Modules\Finance\Http\Controllers\FinanceDashboardController;

use App\Modules\Finance\Http\Controllers\AccountController;
use App\Modules\Finance\Http\Controllers\BudgetController;
use App\Modules\Finance\Http\Controllers\BudgetLineController;
use App\Modules\Finance\Http\Controllers\BankAccountController;
use App\Modules\Finance\Http\Controllers\BankTransactionController;
use App\Modules\Finance\Http\Controllers\BankReconciliationController;
use App\Modules\Finance\Http\Controllers\BankStatementController;
use App\Modules\Finance\Http\Controllers\BillController;
use App\Modules\Finance\Http\Controllers\ContactController;
use App\Modules\Finance\Http\Controllers\CreditNoteController;
use App\Modules\Finance\Http\Controllers\ExchangeRateController;
use App\Modules\Finance\Http\Controllers\InvoiceController;
use App\Modules\Finance\Http\Controllers\JournalEntryController;
use App\Modules\Finance\Http\Controllers\QuoteController;
use App\Modules\Finance\Http\Controllers\ReconciliationController;
use App\Modules\Finance\Http\Controllers\RecurringInvoiceController;
use App\Modules\Finance\Http\Controllers\ReportController;
use App\Modules\Finance\Http\Controllers\SalesOrderController;
use App\Modules\Finance\Http\Controllers\FixedAssetController;
use App\Modules\Finance\Http\Controllers\PriceListController;
use App\Modules\Finance\Http\Controllers\AttachmentController;
use App\Modules\Finance\Http\Controllers\BatchPaymentController;
use App\Modules\Finance\Http\Controllers\DeliveryNoteController;
use App\Modules\Finance\Http\Controllers\ProjectController;
use App\Modules\Finance\Http\Controllers\ProjectTaskController;
use Illuminate\Support\Facades\Route;
use App\Modules\Finance\Http\Controllers\VendorProfileController;
use App\Modules\Finance\Http\Controllers\VendorEvaluationController;
use App\Modules\Finance\Http\Controllers\DocumentTemplateController;
use App\Modules\Finance\Http\Controllers\SubscriptionController;
use App\Modules\Finance\Http\Controllers\SubscriptionPlanController;
use App\Modules\Finance\Http\Controllers\CommissionController;
use App\Modules\Finance\Http\Controllers\CommissionRuleController;
use App\Modules\Finance\Http\Controllers\ContractController;
use App\Modules\Finance\Http\Controllers\ReturnRequestController;
use App\Modules\Finance\Http\Controllers\TaxRateController;
use App\Modules\Finance\Http\Controllers\TaxGroupController;
use App\Modules\Finance\Http\Controllers\ServiceAgreementController;
use App\Modules\Finance\Http\Controllers\LoyaltyProgramController;
use App\Modules\Finance\Http\Controllers\LeadController;
use App\Modules\Finance\Http\Controllers\SupportTicketController;
use App\Modules\Finance\Http\Controllers\CurrencyController;
use App\Modules\Finance\Http\Controllers\PaymentTermController;
use App\Modules\Finance\Http\Controllers\CustomerGroupController;
use App\Modules\Finance\Http\Controllers\MultiCurrencyReportController;


Route::middleware(['web','auth','verified'])->prefix('finance')->name('finance.')->group(function() {
    Route::get('dashboard', [FinanceDashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {

    // Chart of Accounts
    Route::resource('accounts', AccountController::class)->except(['show']);

    // Contacts
    Route::resource('contacts', ContactController::class)->except(['show']);

    // Journal Entries
    Route::resource('journal-entries', JournalEntryController::class)->except(['edit', 'update']);
    Route::patch('journal-entries/{journalEntry}/post', [JournalEntryController::class, 'post'])
        ->name('journal-entries.post');

    // Invoices
    Route::resource('invoices', InvoiceController::class)->except(['edit', 'update']);
    Route::patch('invoices/{invoice}/send', [InvoiceController::class, 'send'])->name('invoices.send');
    Route::patch('invoices/{invoice}/cancel', [InvoiceController::class, 'cancel'])->name('invoices.cancel');
    Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment'])
        ->name('invoices.payments.store');
    Route::get('invoices/{invoice}/print', [InvoiceController::class, 'print'])
        ->name('invoices.print');

    // PDF + Email routes
    Route::get('/invoices/{invoice}/pdf',   [InvoiceController::class, 'pdf'])->name('finance.invoices.pdf');
    Route::post('/invoices/{invoice}/email', [InvoiceController::class, 'email'])->name('finance.invoices.email');
    Route::get('/quotes/{quote}/pdf',       [QuoteController::class, 'pdf'])->name('finance.quotes.pdf');
    Route::post('/quotes/{quote}/email',     [QuoteController::class, 'email'])->name('finance.quotes.email');
    Route::get('/bills/{bill}/pdf',         [BillController::class, 'pdf'])->name('finance.bills.pdf');
    Route::post('/bills/{bill}/email',       [BillController::class, 'email'])->name('finance.bills.email');

    // Bills (AP)
    Route::resource('bills', BillController::class)->except(['edit', 'update']);
    Route::patch('bills/{bill}/receive', [BillController::class, 'receive'])->name('bills.receive');
    Route::patch('bills/{bill}/cancel', [BillController::class, 'cancel'])->name('bills.cancel');
    Route::post('bills/{bill}/payments', [BillController::class, 'recordPayment'])
        ->name('bills.payments.store');

    // Quotes
    Route::get('quotes', [QuoteController::class, 'index'])->name('quotes.index');
    Route::get('quotes/create', [QuoteController::class, 'create'])->name('quotes.create');
    Route::post('quotes', [QuoteController::class, 'store'])->name('quotes.store');
    Route::get('quotes/{quote}', [QuoteController::class, 'show'])->name('quotes.show');
    Route::patch('quotes/{quote}/send', [QuoteController::class, 'send'])->name('quotes.send');
    Route::patch('quotes/{quote}/accept', [QuoteController::class, 'accept'])->name('quotes.accept');
    Route::patch('quotes/{quote}/decline', [QuoteController::class, 'decline'])->name('quotes.decline');
    Route::post('quotes/{quote}/convert', [QuoteController::class, 'convertToInvoice'])->name('quotes.convert');
    Route::delete('quotes/{quote}', [QuoteController::class, 'destroy'])->name('quotes.destroy');

    // Sales Orders
    Route::get('sales-orders', [SalesOrderController::class, 'index'])->name('sales-orders.index');
    Route::get('sales-orders/create', [SalesOrderController::class, 'create'])->name('sales-orders.create');
    Route::post('sales-orders', [SalesOrderController::class, 'store'])->name('sales-orders.store');
    Route::get('sales-orders/{salesOrder}', [SalesOrderController::class, 'show'])->name('sales-orders.show');
    Route::patch('sales-orders/{salesOrder}/confirm', [SalesOrderController::class, 'confirm'])->name('sales-orders.confirm');
    Route::post('sales-orders/{salesOrder}/confirm', [SalesOrderController::class, 'confirm'])->name('sales-orders.confirm-post');
    Route::post('sales-orders/{salesOrder}/fulfill', [SalesOrderController::class, 'fulfill'])->name('sales-orders.fulfill');
    Route::patch('sales-orders/{salesOrder}/cancel', [SalesOrderController::class, 'cancel'])->name('sales-orders.cancel');
    Route::post('sales-orders/{salesOrder}/cancel', [SalesOrderController::class, 'cancel'])->name('sales-orders.cancel-post');
    Route::post('sales-orders/{salesOrder}/convert', [SalesOrderController::class, 'convertToInvoice'])->name('sales-orders.convert');
    Route::post('sales-orders/{salesOrder}/convert-to-invoice', [SalesOrderController::class, 'convertToInvoice'])->name('sales-orders.convert-to-invoice');
    Route::delete('sales-orders/{salesOrder}', [SalesOrderController::class, 'destroy'])->name('sales-orders.destroy');

    // Recurring Invoices
    Route::get('recurring-invoices', [RecurringInvoiceController::class, 'index'])->name('recurring-invoices.index');
    Route::get('recurring-invoices/create', [RecurringInvoiceController::class, 'create'])->name('recurring-invoices.create');
    Route::post('recurring-invoices', [RecurringInvoiceController::class, 'store'])->name('recurring-invoices.store');
    Route::get('recurring-invoices/{recurringInvoice}', [RecurringInvoiceController::class, 'show'])->name('recurring-invoices.show');
    Route::patch('recurring-invoices/{recurringInvoice}/pause', [RecurringInvoiceController::class, 'pause'])->name('recurring-invoices.pause');
    Route::patch('recurring-invoices/{recurringInvoice}/resume', [RecurringInvoiceController::class, 'resume'])->name('recurring-invoices.resume');
    Route::post('recurring-invoices/{recurringInvoice}/generate', [RecurringInvoiceController::class, 'generateNow'])->name('recurring-invoices.generate');
    Route::delete('recurring-invoices/{recurringInvoice}', [RecurringInvoiceController::class, 'destroy'])->name('recurring-invoices.destroy');

    // Credit Notes — custom actions BEFORE resource
    Route::post('credit-notes/{creditNote}/issue',  [CreditNoteController::class, 'issue'])->name('credit-notes.issue');
    Route::post('credit-notes/{creditNote}/apply',  [CreditNoteController::class, 'apply'])->name('credit-notes.apply');
    Route::post('credit-notes/{creditNote}/void',   [CreditNoteController::class, 'void'])->name('credit-notes.void');
    Route::resource('credit-notes', CreditNoteController::class)->except(['edit', 'update']);

    // Reports
    Route::get('reports/trial-balance', [ReportController::class, 'trialBalance'])
        ->name('reports.trial-balance');
    Route::get('reports/profit-loss', [ReportController::class, 'profitAndLoss'])
        ->name('reports.profit-loss');
    Route::get('reports/balance-sheet', [ReportController::class, 'balanceSheet'])
        ->name('reports.balance-sheet');
    Route::get('reports/aged-receivables', [ReportController::class, 'agedReceivables'])->name('reports.aged-receivables');
    Route::get('reports/aged-payables',    [ReportController::class, 'agedPayables'])->name('reports.aged-payables');
    Route::get('reports/account-ledger',               [ReportController::class, 'accountLedgerIndex'])->name('reports.account-ledger.index');
    Route::get('reports/account-ledger/{account}',     [ReportController::class, 'accountLedger'])->name('reports.account-ledger');
    Route::get('reports/customer-statement', [ReportController::class, 'customerStatementIndex'])->name('reports.customer-statement.index');
    Route::get('reports/customer-statement/export', [ReportController::class, 'exportCustomerStatement'])->name('reports.customer-statement.export');
    Route::get('reports/customer-statement/{contact}', [ReportController::class, 'customerStatement'])->name('reports.customer-statement');
    Route::get('reports/supplier-statement', [ReportController::class, 'supplierStatement'])->name('reports.supplier-statement');
    Route::get('reports/supplier-statement/export', [ReportController::class, 'exportSupplierStatement'])->name('reports.supplier-statement.export');
    Route::get('reports/vat-report', [ReportController::class, 'vatReport'])->name('reports.vat-report');
    Route::get('reports/cash-flow-forecast', [ReportController::class, 'cashFlowForecast'])->name('reports.cash-flow-forecast');

    // CSV exports
    Route::get('reports/profit-loss/export',              [ReportController::class, 'exportProfitLoss'])->name('reports.profit-loss.export');
    Route::get('reports/balance-sheet/export',            [ReportController::class, 'exportBalanceSheet'])->name('reports.balance-sheet.export');
    Route::get('reports/aged-receivables/export',         [ReportController::class, 'exportAgedReceivables'])->name('reports.aged-receivables.export');
    Route::get('reports/aged-payables/export',            [ReportController::class, 'exportAgedPayables'])->name('reports.aged-payables.export');
    Route::get('reports/account-ledger/{account}/export', [ReportController::class, 'exportAccountLedger'])->name('reports.account-ledger.export');
    Route::get('reports/vat-report/export',               [ReportController::class, 'exportVatReport'])->name('reports.vat-report.export');
    Route::get('reports/comparative-profit-loss', [ReportController::class, 'comparativeProfitLoss'])->name('reports.comparative-profit-loss');
    Route::get('reports/comparative-profit-loss/export', [ReportController::class, 'exportComparativeProfitLoss'])->name('reports.comparative-profit-loss.export');
    Route::get('reports/cash-flow-forecast/export',       [ReportController::class, 'exportCashFlowForecast'])->name('reports.cash-flow-forecast.export');

    // Currencies — set-base BEFORE resource
    Route::post('currencies/{currency}/set-base', [CurrencyController::class, 'setBase'])->name('currencies.set-base');
    Route::resource('currencies', CurrencyController::class)->except(['show']);

    // Exchange Rates — convert and report BEFORE resource to avoid them being treated as IDs
    Route::get('exchange-rates/convert', [ExchangeRateController::class, 'convert'])->name('exchange-rates.convert');
    Route::get('exchange-rates/report', [ExchangeRateController::class, 'report'])->name('exchange-rates.report');
    Route::resource('exchange-rates', ExchangeRateController::class)->only(['index', 'create', 'store', 'destroy']);

    // Budgets — custom actions BEFORE resource
    Route::post('budgets/{budget}/activate',                [BudgetController::class, 'activate'])->name('budgets.activate');
    Route::post('budgets/{budget}/close',                   [BudgetController::class, 'close'])->name('budgets.close');
    Route::post('budgets/{budget}/lines',                   [BudgetController::class, 'addLine'])->name('budgets.lines.add');
    Route::patch('budgets/{budget}/lines/{line}/actual',    [BudgetController::class, 'updateActual'])->name('budgets.lines.actual');
    Route::delete('budgets/{budget}/lines/{line}',          [BudgetController::class, 'removeLine'])->name('budgets.lines.remove');
    Route::resource('budgets', BudgetController::class);

    // Budget Lines (legacy routes kept for backwards compatibility)
    Route::patch('budget-lines/{budgetLine}', [BudgetLineController::class, 'update'])->name('budget-lines.update');
    Route::delete('budget-lines/{budgetLine}', [BudgetLineController::class, 'destroy'])->name('budget-lines.destroy');

    // Bank Accounts
    Route::resource('bank-accounts', BankAccountController::class);
    Route::post('bank-accounts/{bankAccount}/import', [BankStatementController::class, 'import'])->name('bank-accounts.import');

    // Reconciliation
    Route::get('reconciliation',                                 [ReconciliationController::class, 'index'])->name('reconciliation.index');
    Route::post('reconciliation/{bankTransaction}/match',        [ReconciliationController::class, 'match'])->name('reconciliation.match');
    Route::post('reconciliation/{bankTransaction}/unmatch',      [ReconciliationController::class, 'unmatch'])->name('reconciliation.unmatch');

    // Bank Transactions
    Route::patch('bank-transactions/{bankTransaction}/reconcile', [BankTransactionController::class, 'reconcile'])->name('bank-transactions.reconcile');
    Route::resource('bank-transactions', BankTransactionController::class)->except(['show', 'edit', 'update']);

    // Bank Reconciliations
    Route::post('bank-reconciliations/{bankReconciliation}/complete', [BankReconciliationController::class, 'complete'])->name('bank-reconciliations.complete');
    Route::resource('bank-reconciliations', BankReconciliationController::class)->except(['edit', 'update']);

    // Fixed Assets
    Route::post('fixed-assets/{fixedAsset}/depreciate', [FixedAssetController::class, 'depreciate'])->name('fixed-assets.depreciate');
    Route::post('fixed-assets/{fixedAsset}/dispose',    [FixedAssetController::class, 'dispose'])->name('fixed-assets.dispose');
    Route::resource('fixed-assets', FixedAssetController::class)->except(['edit', 'update']);

    // Price Lists
    Route::get('price-lists/price-for-contact', [PriceListController::class, 'priceForContact'])->name('price-lists.price-for-contact');
    Route::post('price-lists/{priceList}/items',          [PriceListController::class, 'addItem'])->name('price-lists.items.add');
    Route::delete('price-lists/{priceList}/items/{item}', [PriceListController::class, 'removeItem'])->name('price-lists.items.remove');
    Route::resource('price-lists', PriceListController::class)->except(['edit']);

    // Projects — actions before resource
    Route::post('projects/{project}/activate',         [ProjectController::class, 'activate'])->name('projects.activate');
    Route::post('projects/{project}/complete',         [ProjectController::class, 'complete'])->name('projects.complete');
    Route::post('projects/{project}/tasks',            [ProjectController::class, 'addTask'])->name('projects.tasks.add');
    Route::patch('projects/{project}/tasks/{task}',    [ProjectTaskController::class, 'update'])->name('projects.tasks.update');
    Route::delete('projects/{project}/tasks/{task}',   [ProjectTaskController::class, 'destroy'])->name('projects.tasks.destroy');
    Route::post('projects/{project}/time-entries',     [ProjectController::class, 'addTimeEntry'])->name('projects.time-entries.add');
    Route::resource('projects', ProjectController::class)->except(['edit', 'update']);

    // Batch Payments
    Route::resource('batch-payments', BatchPaymentController::class)->except(['edit', 'update']);

    // File Attachments
    Route::post('attachments/{modelType}/{modelId}', [AttachmentController::class, 'store'])->name('attachments.store');
    Route::get('attachments/{attachment}/download', [AttachmentController::class, 'download'])->name('attachments.download');
    Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy'])->name('attachments.destroy');
    // Delivery Notes
    Route::resource('delivery-notes', DeliveryNoteController::class)->except(['edit', 'update']);
    Route::post('delivery-notes/{deliveryNote}/dispatch', [DeliveryNoteController::class, 'dispatch'])->name('delivery-notes.dispatch');
    Route::post('delivery-notes/{deliveryNote}/deliver', [DeliveryNoteController::class, 'deliver'])->name('delivery-notes.deliver');

    // Vendor Profiles (nested under contacts)
    Route::get('vendors/{contact}/profile',  [VendorProfileController::class, 'show'])->name('vendors.profile.show');
    Route::put('vendors/{contact}/profile',  [VendorProfileController::class, 'update'])->name('vendors.profile.update');

    // Vendor Evaluations (nested under contacts)
    Route::get('vendors/{contact}/evaluations',        [VendorEvaluationController::class, 'index'])->name('vendors.evaluations.index');
    Route::post('vendors/{contact}/evaluations',       [VendorEvaluationController::class, 'store'])->name('vendors.evaluations.store');
    Route::delete('vendors/{contact}/evaluations/{evaluation}', [VendorEvaluationController::class, 'destroy'])->name('vendors.evaluations.destroy');

    // Document Templates
    Route::get('document-templates/preview', [DocumentTemplateController::class, 'preview'])->name('document-templates.preview');
    Route::resource('document-templates', DocumentTemplateController::class)->except(['show']);
    Route::get('document-templates/{documentTemplate}', [DocumentTemplateController::class, 'show'])->name('document-templates.show');

    // Subscription Plans
    Route::resource('subscription-plans', SubscriptionPlanController::class)->except(['edit', 'update']);

    // Subscriptions
    Route::post('subscriptions/{subscription}/activate',        [SubscriptionController::class, 'activate'])->name('subscriptions.activate');
    Route::post('subscriptions/{subscription}/cancel',          [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    Route::post('subscriptions/{subscription}/pause',           [SubscriptionController::class, 'pause'])->name('subscriptions.pause');
    Route::post('subscriptions/{subscription}/generate-invoice',[SubscriptionController::class, 'generateInvoice'])->name('subscriptions.generate-invoice');
    Route::resource('subscriptions', SubscriptionController::class)->except(['edit', 'update']);

    // Customer Portal Token (admin generates token for a contact)
    Route::post('contacts/{contact}/portal-token', [\App\Modules\Finance\Http\Controllers\CustomerPortalController::class, 'generateToken'])->name('contacts.portal-token');


    // Commission Rules
    Route::resource('commission-rules', CommissionRuleController::class)->except(['edit', 'update']);

    // Commissions
    Route::post('commissions/{commission}/approve',  [CommissionController::class, 'approve'])->name('commissions.approve');
    Route::post('commissions/{commission}/mark-paid',[CommissionController::class, 'markPaid'])->name('commissions.mark-paid');
    Route::post('commissions/generate',             [CommissionController::class, 'generate'])->name('commissions.generate');
    Route::resource('commissions', CommissionController::class)->except(['edit', 'update']);


    // Contracts — custom actions BEFORE resource
    Route::post('contracts/{contract}/activate',  [ContractController::class, 'activate'])->name('contracts.activate');
    Route::post('contracts/{contract}/terminate', [ContractController::class, 'terminate'])->name('contracts.terminate');
    Route::post('contracts/{contract}/renew',     [ContractController::class, 'renew'])->name('contracts.renew');
    Route::resource('contracts', ContractController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);

    // Return Requests — custom actions BEFORE resource
    Route::post('return-requests/{returnRequest}/approve',       [ReturnRequestController::class, 'approve'])->name('return-requests.approve');
    Route::post('return-requests/{returnRequest}/reject',        [ReturnRequestController::class, 'reject'])->name('return-requests.reject');
    Route::post('return-requests/{returnRequest}/mark-refunded', [ReturnRequestController::class, 'markRefunded'])->name('return-requests.mark-refunded');
    Route::resource('return-requests', ReturnRequestController::class)->except(['edit', 'update']);
    // Tax Rates
    Route::resource('tax-rates', TaxRateController::class)->except(['edit', 'update']);

    // Tax Groups — custom actions BEFORE resource
    Route::post('tax-groups/{taxGroup}/rates',        [TaxGroupController::class, 'addRate'])->name('tax-groups.rates.add');
    Route::delete('tax-groups/{taxGroup}/rates/{item}', [TaxGroupController::class, 'removeRate'])->name('tax-groups.rates.remove');
    Route::resource('tax-groups', TaxGroupController::class)->except(['edit', 'update']);

    // Service Agreements — custom actions BEFORE resource
    Route::post('service-agreements/{serviceAgreement}/activate',             [ServiceAgreementController::class, 'activate'])->name('service-agreements.activate');
    Route::post('service-agreements/{serviceAgreement}/terminate',            [ServiceAgreementController::class, 'terminate'])->name('service-agreements.terminate');
    Route::post('service-agreements/{serviceAgreement}/items',               [ServiceAgreementController::class, 'addItem'])->name('service-agreements.items.add');
    Route::post('service-agreements/{serviceAgreement}/logs',                [ServiceAgreementController::class, 'addLog'])->name('service-agreements.logs.add');
    Route::post('service-agreements/{serviceAgreement}/logs/{log}/complete', [ServiceAgreementController::class, 'completeLog'])->name('service-agreements.logs.complete');
    Route::resource('service-agreements', ServiceAgreementController::class)->except(['edit', 'update']);

    // Loyalty Programs
    Route::post("loyalty-programs/{loyaltyProgram}/enroll",        [LoyaltyProgramController::class, "enroll"])->name("loyalty-programs.enroll");
    Route::post("loyalty-programs/{loyaltyProgram}/earn-points",   [LoyaltyProgramController::class, "earnPoints"])->name("loyalty-programs.earn-points");
    Route::post("loyalty-programs/{loyaltyProgram}/redeem-points",  [LoyaltyProgramController::class, "redeemPoints"])->name("loyalty-programs.redeem-points");
    Route::resource("loyalty-programs", LoyaltyProgramController::class)->except(["edit", "update"]);

    // Leads
    Route::post('leads/{lead}/mark-won',    [LeadController::class, 'markWon'])->name('leads.mark-won');
    Route::post('leads/{lead}/mark-lost',   [LeadController::class, 'markLost'])->name('leads.mark-lost');
    Route::post('leads/{lead}/activities',  [LeadController::class, 'addActivity'])->name('leads.activities.add');
    Route::resource('leads', LeadController::class)->except(['edit']);

    // Support Tickets
    Route::post('support-tickets/{supportTicket}/resolve',    [SupportTicketController::class, 'resolve'])->name('support-tickets.resolve');
    Route::post('support-tickets/{supportTicket}/close',      [SupportTicketController::class, 'close'])->name('support-tickets.close');
    Route::post('support-tickets/{supportTicket}/reopen',     [SupportTicketController::class, 'reopen'])->name('support-tickets.reopen');
    Route::patch('support-tickets/{supportTicket}/assign',    [SupportTicketController::class, 'assign'])->name('support-tickets.assign');
    Route::post('support-tickets/{supportTicket}/comments',   [SupportTicketController::class, 'addComment'])->name('support-tickets.comments.add');
    Route::resource('support-tickets', SupportTicketController::class)->except(['edit', 'update']);

    // Customer Groups — custom member actions BEFORE resource
    Route::post('customer-groups/{customerGroup}/members',              [CustomerGroupController::class, 'addMember'])->name('finance.customer-groups.members.add');
    Route::delete('customer-groups/{customerGroup}/members/{contact}',  [CustomerGroupController::class, 'removeMember'])->name('finance.customer-groups.members.remove');
    Route::resource('customer-groups', CustomerGroupController::class)->except(['create', 'edit']);

    // Multi-Currency Consolidation
    Route::get('multi-currency/report', [MultiCurrencyReportController::class, 'index'])->name('multi-currency.report');
    Route::get('multi-currency/convert', [MultiCurrencyReportController::class, 'convertPreview'])->name('multi-currency.convert');

});


// Expense Claims — custom actions BEFORE resource
use App\Modules\Finance\Http\Controllers\ExpenseClaimController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('expense-claims/{expenseClaim}/submit',   [ExpenseClaimController::class, 'submit'])->name('expense-claims.submit');
    Route::post('expense-claims/{expenseClaim}/approve',  [ExpenseClaimController::class, 'approve'])->name('expense-claims.approve');
    Route::post('expense-claims/{expenseClaim}/reject',   [ExpenseClaimController::class, 'reject'])->name('expense-claims.reject');
    Route::post('expense-claims/{expenseClaim}/mark-paid',[ExpenseClaimController::class, 'markPaid'])->name('expense-claims.mark-paid');
    Route::resource('expense-claims', ExpenseClaimController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
});

// Vendor Bills — custom actions BEFORE resource
use App\Modules\Finance\Http\Controllers\VendorBillController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('vendor-bills/{vendorBill}/submit',  [VendorBillController::class, 'submit'])->name('vendor-bills.submit');
    Route::post('vendor-bills/{vendorBill}/approve', [VendorBillController::class, 'approve'])->name('vendor-bills.approve');
    Route::post('vendor-bills/{vendorBill}/pay',     [VendorBillController::class, 'pay'])->name('vendor-bills.pay');
    Route::post('vendor-bills/{vendorBill}/cancel',  [VendorBillController::class, 'cancel'])->name('vendor-bills.cancel');
    Route::resource('vendor-bills', VendorBillController::class);
});

// Payment Terms
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::resource('payment-terms', PaymentTermController::class)->except(['create', 'edit']);
});

// Petty Cash — custom actions BEFORE resource
use App\Modules\Finance\Http\Controllers\PettyCashFundController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('petty-cash/{pettyCashFund}/replenish', [PettyCashFundController::class, 'replenish'])->name('petty-cash.replenish');
    Route::post('petty-cash/{pettyCashFund}/expense',   [PettyCashFundController::class, 'expense'])->name('petty-cash.expense');
    Route::resource('petty-cash', PettyCashFundController::class)->except(['create', 'edit', 'update']);
});

// Bank Transfers — custom actions BEFORE resource
use App\Modules\Finance\Http\Controllers\BankTransferController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('bank-transfers/{bankTransfer}/complete', [BankTransferController::class, 'complete'])->name('bank-transfers.complete');
    Route::post('bank-transfers/{bankTransfer}/fail',     [BankTransferController::class, 'fail'])->name('bank-transfers.fail');
    Route::post('bank-transfers/{bankTransfer}/cancel',   [BankTransferController::class, 'cancel'])->name('bank-transfers.cancel');
    Route::resource('bank-transfers', BankTransferController::class)->except(['create', 'edit', 'update']);
});

// Advance Payments — custom actions BEFORE resource
use App\Modules\Finance\Http\Controllers\AdvancePaymentController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('advance-payments/{advancePayment}/apply',  [AdvancePaymentController::class, 'apply'])->name('advance-payments.apply');
    Route::post('advance-payments/{advancePayment}/refund', [AdvancePaymentController::class, 'refund'])->name('advance-payments.refund');
    Route::resource('advance-payments', AdvancePaymentController::class)->except(['create', 'edit', 'update']);
});


// Debit Notes — custom actions BEFORE resource
use App\Modules\Finance\Http\Controllers\DebitNoteController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('debit-notes/{debitNote}/issue',  [DebitNoteController::class, 'issue'])->name('debit-notes.issue');
    Route::post('debit-notes/{debitNote}/apply',  [DebitNoteController::class, 'apply'])->name('debit-notes.apply');
    Route::post('debit-notes/{debitNote}/void',   [DebitNoteController::class, 'void'])->name('debit-notes.void');
    Route::resource('debit-notes', DebitNoteController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Write-offs — custom actions BEFORE resource
use App\Modules\Finance\Http\Controllers\WriteOffController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('write-offs/{writeOff}/approve', [WriteOffController::class, 'approve'])->name('write-offs.approve');
    Route::post('write-offs/{writeOff}/reverse', [WriteOffController::class, 'reverse'])->name('write-offs.reverse');
    Route::resource('write-offs', WriteOffController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Intercompany Transactions — custom actions BEFORE resource
use App\Modules\Finance\Http\Controllers\IntercompanyController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('intercompany/{intercompany}/post',       [IntercompanyController::class, 'post'])->name('intercompany.post');
    Route::post('intercompany/{intercompany}/reconcile',  [IntercompanyController::class, 'reconcile'])->name('intercompany.reconcile');
    Route::post('intercompany/{intercompany}/reverse',    [IntercompanyController::class, 'reverse'])->name('intercompany.reverse');
    Route::resource('intercompany', IntercompanyController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Cash Flow Forecasts
use App\Modules\Finance\Http\Controllers\CashFlowForecastController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('cash-flow-forecasts/{cash_flow_forecast}/publish', [CashFlowForecastController::class, 'publish'])->name('cash-flow-forecasts.publish');
    Route::post('cash-flow-forecasts/{cash_flow_forecast}/archive', [CashFlowForecastController::class, 'archive'])->name('cash-flow-forecasts.archive');
    Route::resource('cash-flow-forecasts', CashFlowForecastController::class);
});

// Recurring Expenses
use App\Modules\Finance\Http\Controllers\RecurringExpenseController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('recurring-expenses/{recurring_expense}/pause',  [RecurringExpenseController::class, 'pause'])->name('recurring-expenses.pause');
    Route::post('recurring-expenses/{recurring_expense}/resume', [RecurringExpenseController::class, 'resume'])->name('recurring-expenses.resume');
    Route::post('recurring-expenses/{recurring_expense}/cancel', [RecurringExpenseController::class, 'cancel'])->name('recurring-expenses.cancel');
    Route::resource('recurring-expenses', RecurringExpenseController::class);
});

// Vendor Payments
use App\Modules\Finance\Http\Controllers\VendorPaymentController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('vendor-payments/{vendor_payment}/approve', [VendorPaymentController::class, 'approve'])->name('vendor-payments.approve');
    Route::post('vendor-payments/{vendor_payment}/process', [VendorPaymentController::class, 'process'])->name('vendor-payments.process');
    Route::post('vendor-payments/{vendor_payment}/reject',  [VendorPaymentController::class, 'reject'])->name('vendor-payments.reject');
    Route::post('vendor-payments/{vendor_payment}/cancel',  [VendorPaymentController::class, 'cancel'])->name('vendor-payments.cancel');
    Route::resource('vendor-payments', VendorPaymentController::class);
});

// Payment Schedules
use App\Modules\Finance\Http\Controllers\PaymentScheduleController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('payment-schedules/{payment_schedule}/pause',  [PaymentScheduleController::class, 'pause'])->name('payment-schedules.pause');
    Route::post('payment-schedules/{payment_schedule}/resume', [PaymentScheduleController::class, 'resume'])->name('payment-schedules.resume');
    Route::post('payment-schedules/{payment_schedule}/cancel', [PaymentScheduleController::class, 'cancel'])->name('payment-schedules.cancel');
    Route::resource('payment-schedules', PaymentScheduleController::class);
});

// Customer Credits
use App\Modules\Finance\Http\Controllers\CustomerCreditController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('customer-credits/{customer_credit}/issue',  [CustomerCreditController::class, 'issue'])->name('customer-credits.issue');
    Route::post('customer-credits/{customer_credit}/expire', [CustomerCreditController::class, 'expire'])->name('customer-credits.expire');
    Route::post('customer-credits/{customer_credit}/cancel', [CustomerCreditController::class, 'cancel'])->name('customer-credits.cancel');
    Route::resource('customer-credits', CustomerCreditController::class);
});

// Expense Budgets
use App\Modules\Finance\Http\Controllers\ExpenseBudgetController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('expense-budgets/{expense_budget}/freeze', [ExpenseBudgetController::class, 'freeze'])->name('expense-budgets.freeze');
    Route::post('expense-budgets/{expense_budget}/close',  [ExpenseBudgetController::class, 'close'])->name('expense-budgets.close');
    Route::resource('expense-budgets', ExpenseBudgetController::class);
});

// Profit Centers
use App\Modules\Finance\Http\Controllers\ProfitCenterController;
Route::middleware(['web', 'auth', 'verified'])->prefix('finance')->name('finance.')->group(function () {
    Route::post('profit-centers/{profit_center}/activate',   [ProfitCenterController::class, 'activate'])->name('profit-centers.activate');
    Route::post('profit-centers/{profit_center}/deactivate', [ProfitCenterController::class, 'deactivate'])->name('profit-centers.deactivate');
    Route::resource('profit-centers', ProfitCenterController::class);
});

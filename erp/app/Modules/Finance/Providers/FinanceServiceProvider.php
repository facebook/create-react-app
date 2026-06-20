<?php

namespace App\Modules\Finance\Providers;

use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\BankAccount;
use App\Modules\Finance\Models\BankTransaction;
use App\Modules\Finance\Models\BankReconciliation;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\CreditNote;
use App\Modules\Finance\Models\DeliveryNote;
use App\Modules\Finance\Models\Currency;
use App\Modules\Finance\Models\ExchangeRate;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\JournalEntry;
use App\Modules\Finance\Models\Quote;
use App\Modules\Finance\Models\RecurringInvoice;
use App\Modules\Finance\Models\SalesOrder;
use App\Modules\Finance\Models\Budget;
use App\Modules\Finance\Models\BudgetLine;
use App\Modules\Finance\Models\PriceList;
use App\Modules\Finance\Models\PriceListItem;
use App\Modules\Finance\Models\DepreciationEntry;
use App\Modules\Finance\Models\FixedAsset;
use App\Modules\Finance\Models\Attachment;
use App\Modules\Finance\Models\BatchPayment;
use App\Modules\Finance\Models\DocumentTemplate;
use App\Modules\Finance\Models\Project;
use App\Modules\Finance\Models\ProjectTask;
use App\Modules\Finance\Models\ProjectTimeEntry;
use App\Modules\Finance\Policies\AttachmentPolicy;
use App\Modules\Finance\Policies\BatchPaymentPolicy;
use App\Modules\Finance\Policies\DocumentTemplatePolicy;
use App\Modules\Finance\Policies\AccountPolicy;
use App\Modules\Finance\Policies\DeliveryNotePolicy;
use App\Modules\Finance\Policies\PriceListPolicy;
use App\Modules\Finance\Policies\ProjectPolicy;
use App\Modules\Finance\Policies\BudgetPolicy;
use App\Modules\Finance\Policies\FixedAssetPolicy;
use App\Modules\Finance\Policies\BankAccountPolicy;
use App\Modules\Finance\Policies\BankTransactionPolicy;
use App\Modules\Finance\Policies\BankPolicy;
use App\Modules\Finance\Policies\BillPolicy;
use App\Modules\Finance\Policies\ContactPolicy;
use App\Modules\Finance\Policies\CreditNotePolicy;
use App\Modules\Finance\Policies\CurrencyPolicy;
use App\Modules\Finance\Policies\ExchangeRatePolicy;
use App\Modules\Finance\Policies\InvoicePolicy;
use App\Modules\Finance\Policies\JournalEntryPolicy;
use App\Modules\Finance\Policies\QuotePolicy;
use App\Modules\Finance\Policies\RecurringInvoicePolicy;
use App\Modules\Finance\Policies\SalesOrderPolicy;
use App\Modules\Finance\Models\Subscription;
use App\Modules\Finance\Models\SubscriptionPlan;
use App\Modules\Finance\Policies\SubscriptionPolicy;
use App\Modules\Finance\Models\Commission;
use App\Modules\Finance\Models\CommissionRule;
use App\Modules\Finance\Models\Contract;
use App\Modules\Finance\Models\ContractRenewal;
use App\Modules\Finance\Policies\ContractPolicy;
use App\Modules\Finance\Policies\CommissionPolicy;
use App\Modules\Finance\Policies\CommissionRulePolicy;
use App\Modules\Finance\Models\ReturnRequest;
use App\Modules\Finance\Models\ReturnRequestItem;
use App\Modules\Finance\Policies\ReturnRequestPolicy;
use App\Modules\Finance\Models\TaxRate;
use App\Modules\Finance\Models\TaxGroup;
use App\Modules\Finance\Models\TaxGroupItem;
use App\Modules\Finance\Policies\TaxPolicy;
use App\Modules\Finance\Models\ServiceAgreement;
use App\Modules\Finance\Models\ServiceAgreementItem;
use App\Modules\Finance\Models\MaintenanceLog;
use App\Modules\Finance\Policies\ServiceAgreementPolicy;
use App\Modules\Finance\Models\LoyaltyProgram;
use App\Modules\Finance\Models\Lead;
use App\Modules\Finance\Models\LeadActivity;
use App\Modules\Finance\Policies\LeadPolicy;
use App\Modules\Finance\Models\LoyaltyEnrollment;
use App\Modules\Finance\Models\LoyaltyTransaction;
use App\Modules\Finance\Policies\LoyaltyPolicy;
use App\Modules\Finance\Models\SupportTicket;
use App\Modules\Finance\Models\TicketComment;
use App\Modules\Finance\Policies\SupportTicketPolicy;
use App\Modules\Finance\Models\ExpenseClaim;
use App\Modules\Finance\Models\VendorBill;
use App\Modules\Finance\Models\VendorBillItem;
use App\Modules\Finance\Policies\VendorBillPolicy;
use App\Modules\Finance\Models\ExpenseItem;
use App\Modules\Finance\Policies\ExpenseClaimPolicy;
use App\Modules\Finance\Models\PaymentTerm;
use App\Modules\Finance\Policies\PaymentTermPolicy;
use App\Modules\Finance\Models\PettyCashFund;
use App\Modules\Finance\Models\PettyCashTransaction;
use App\Modules\Finance\Policies\PettyCashPolicy;
use App\Modules\Finance\Models\BankTransfer;
use App\Modules\Finance\Policies\BankTransferPolicy;
use App\Modules\Finance\Models\AdvancePayment;
use App\Modules\Finance\Models\CustomerGroup;
use App\Modules\Finance\Policies\AdvancePaymentPolicy;
use App\Modules\Finance\Policies\CustomerGroupPolicy;
use App\Modules\Finance\Models\DebitNote;
use App\Modules\Finance\Models\DebitNoteItem;
use App\Modules\Finance\Policies\DebitNotePolicy;
use App\Modules\Finance\Models\WriteOff;
use App\Modules\Finance\Policies\WriteOffPolicy;
use App\Modules\Finance\Models\IntercompanyTransaction;
use App\Modules\Finance\Policies\IntercompanyPolicy;
use App\Modules\Finance\Models\CashFlowForecast;
use App\Modules\Finance\Policies\CashFlowForecastPolicy;
use App\Modules\Finance\Models\RecurringExpense;
use App\Modules\Finance\Policies\RecurringExpensePolicy;
use App\Modules\Finance\Models\VendorPayment;
use App\Modules\Finance\Policies\VendorPaymentPolicy;
use App\Modules\Finance\Models\PaymentSchedule;
use App\Modules\Finance\Models\PaymentScheduleItem;
use App\Modules\Finance\Policies\PaymentSchedulePolicy;
use App\Modules\Finance\Models\CustomerCredit;
use App\Modules\Finance\Policies\CustomerCreditPolicy;
use App\Modules\Finance\Models\ExpenseBudget;
use App\Modules\Finance\Policies\ExpenseBudgetPolicy;
use App\Modules\Finance\Models\ProfitCenter;
use App\Modules\Finance\Policies\ProfitCenterPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class FinanceServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/finance.php');

        Gate::policy(Account::class, AccountPolicy::class);
        Gate::policy(Budget::class,     BudgetPolicy::class);
        Gate::policy(BudgetLine::class, BudgetPolicy::class);
        Gate::policy(Contact::class, ContactPolicy::class);
        Gate::policy(DeliveryNote::class, DeliveryNotePolicy::class);
        Gate::policy(JournalEntry::class, JournalEntryPolicy::class);
        Gate::policy(Invoice::class, InvoicePolicy::class);
        Gate::policy(Bill::class, BillPolicy::class);
        Gate::policy(Quote::class, QuotePolicy::class);
        Gate::policy(CreditNote::class, CreditNotePolicy::class);
        Gate::policy(RecurringInvoice::class, RecurringInvoicePolicy::class);
        Gate::policy(SalesOrder::class, SalesOrderPolicy::class);
        Gate::policy(Currency::class,     CurrencyPolicy::class);
        Gate::policy(ExchangeRate::class, ExchangeRatePolicy::class);
        Gate::policy(BankAccount::class, BankAccountPolicy::class);
        Gate::policy(BankTransaction::class, BankTransactionPolicy::class);
        Gate::policy(BankReconciliation::class, BankPolicy::class);
        Gate::policy(FixedAsset::class, FixedAssetPolicy::class);
        Gate::policy(DepreciationEntry::class, FixedAssetPolicy::class);
        Gate::policy(PriceList::class, PriceListPolicy::class);
        Gate::policy(PriceListItem::class, PriceListPolicy::class);
        Gate::policy(Project::class,          ProjectPolicy::class);
        Gate::policy(ProjectTask::class,      ProjectPolicy::class);
        Gate::policy(ProjectTimeEntry::class, ProjectPolicy::class);
        Gate::policy(Attachment::class, AttachmentPolicy::class);
        Gate::policy(BatchPayment::class, BatchPaymentPolicy::class);
        Gate::policy(DocumentTemplate::class, DocumentTemplatePolicy::class);
        Gate::policy(SubscriptionPlan::class, SubscriptionPolicy::class);
        Gate::policy(Subscription::class,     SubscriptionPolicy::class);
        Gate::policy(Commission::class,     CommissionPolicy::class);
        Gate::policy(CommissionRule::class, CommissionRulePolicy::class);
        Gate::policy(Contract::class, ContractPolicy::class);
        Gate::policy(ContractRenewal::class, ContractPolicy::class);

        Gate::policy(ReturnRequest::class,     ReturnRequestPolicy::class);
        Gate::policy(ReturnRequestItem::class, ReturnRequestPolicy::class);

        Gate::policy(TaxRate::class,      TaxPolicy::class);
        Gate::policy(TaxGroup::class,     TaxPolicy::class);
        Gate::policy(TaxGroupItem::class, TaxPolicy::class);

        Gate::policy(ServiceAgreement::class,     ServiceAgreementPolicy::class);
        Gate::policy(ServiceAgreementItem::class, ServiceAgreementPolicy::class);
        Gate::policy(MaintenanceLog::class,       ServiceAgreementPolicy::class);

        Gate::policy(LoyaltyProgram::class,     LoyaltyPolicy::class);

        Gate::policy(Lead::class,         LeadPolicy::class);
        Gate::policy(LeadActivity::class, LeadPolicy::class);
        Gate::policy(LoyaltyEnrollment::class,  LoyaltyPolicy::class);
        Gate::policy(LoyaltyTransaction::class, LoyaltyPolicy::class);

        Gate::policy(SupportTicket::class,  SupportTicketPolicy::class);
        Gate::policy(TicketComment::class,  SupportTicketPolicy::class);


        Gate::policy(ExpenseClaim::class, ExpenseClaimPolicy::class);
        Gate::policy(VendorBill::class,     VendorBillPolicy::class);
        Gate::policy(VendorBillItem::class, VendorBillPolicy::class);
        Gate::policy(ExpenseItem::class,  ExpenseClaimPolicy::class);
        Gate::policy(PaymentTerm::class, PaymentTermPolicy::class);
        Gate::policy(PettyCashFund::class,        PettyCashPolicy::class);
        Gate::policy(PettyCashTransaction::class, PettyCashPolicy::class);
        Gate::policy(BankTransfer::class, BankTransferPolicy::class);
        Gate::policy(CustomerGroup::class, CustomerGroupPolicy::class);
        Gate::policy(AdvancePayment::class,  AdvancePaymentPolicy::class);
        Gate::policy(DebitNote::class,       DebitNotePolicy::class);
        Gate::policy(DebitNoteItem::class,   DebitNotePolicy::class);
        Gate::policy(WriteOff::class,              WriteOffPolicy::class);
        Gate::policy(IntercompanyTransaction::class, IntercompanyPolicy::class);
        Gate::policy(CashFlowForecast::class,        CashFlowForecastPolicy::class);
        Gate::policy(RecurringExpense::class,        RecurringExpensePolicy::class);
        Gate::policy(VendorPayment::class,           VendorPaymentPolicy::class);
        Gate::policy(PaymentSchedule::class,         PaymentSchedulePolicy::class);
        Gate::policy(PaymentScheduleItem::class,     PaymentSchedulePolicy::class);
        Gate::policy(CustomerCredit::class, CustomerCreditPolicy::class);
        Gate::policy(ExpenseBudget::class, ExpenseBudgetPolicy::class);
        Gate::policy(ProfitCenter::class, ProfitCenterPolicy::class);
        if ($this->app->runningInConsole()) {
            $this->commands([\App\Modules\Finance\Console\Commands\GenerateRecurringInvoices::class]);
        }
    }
}

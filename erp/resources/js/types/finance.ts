export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface Account {
    id: number;
    code: string;
    name: string;
    type: AccountType;
    description?: string;
    is_active: boolean;
    parent_id?: number | null;
    parent?: { id: number; code: string; name: string } | null;
    balance?: number;
}

export interface JournalLine {
    id?: number;
    account_id: number;
    account?: { id: number; code: string; name: string } | null;
    debit: number | string;
    credit: number | string;
    description?: string;
}

export interface JournalEntry {
    id: number;
    date: string;
    reference?: string;
    description: string;
    status: 'draft' | 'posted';
    total_debits?: number;
    total_credits?: number;
    lines?: JournalLine[];
    creator?: { id: number; name: string } | null;
    created_at?: string;
}

export type ContactType = 'customer' | 'vendor' | 'both';

export interface Contact {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    type: ContactType;
    notes?: string;
    is_active: boolean;
    price_list_id?: number | null;
    created_at?: string;
    vendor_profile?: VendorProfile;
    vendor_evaluations?: VendorEvaluation[];
}

export interface PriceListItem {
    id: number;
    price_list_id: number;
    product_id: number;
    unit_price: number;
    min_quantity: number;
    product?: { id: number; name: string; sku: string };
}

export interface PriceList {
    id: number;
    name: string;
    description: string | null;
    currency_code: string;
    discount_percent: number;
    is_active: boolean;
    is_default: boolean;
    valid_from: string | null;
    valid_to: string | null;
    items_count?: number;
    contacts_count?: number;
    items?: PriceListItem[];
    contacts?: Contact[];
    created_at: string;
}

export interface InvoiceItem {
    id?: number;
    description: string;
    quantity: number | string;
    unit_price: number | string;
    tax_rate: number | string;
    subtotal?: number;
    tax?: number;
    line_total?: number;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'other';

export interface Payment {
    id: number;
    amount: number | string;
    payment_date: string;
    method: PaymentMethod;
    reference?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface Invoice {
    id: number;
    number?: string;
    status: InvoiceStatus;
    issue_date: string;
    due_date?: string | null;
    notes?: string;
    is_overdue?: boolean;
    currency_code?: string;
    exchange_rate?: number;
    contact?: { id: number; name: string } | null;
    items?: InvoiceItem[];
    payments?: Payment[];
    subtotal?: number;
    tax_total?: number;
    total?: number;
    base_total?: number;
    amount_paid?: number;
    amount_due?: number;
    transitions?: InvoiceStatus[];
    attachments?: Attachment[];
    creator?: string | null;
    created_at?: string;
}

export interface TrialBalanceRow {
    id: number;
    code: string;
    name: string;
    type: AccountType;
    parent_name?: string;
    total_debit: number;
    total_credit: number;
}

export type BillStatus = 'draft' | 'received' | 'paid' | 'cancelled';

export interface BillItem {
    id?: number;
    description: string;
    quantity: number | string;
    unit_price: number | string;
    tax_rate: number | string;
    line_total?: number;
}

export interface BillPayment {
    id: number;
    amount: number | string;
    payment_date: string;
    method: PaymentMethod;
    reference?: string | null;
}

export interface Bill {
    id: number;
    number?: string | null;
    status: BillStatus;
    issue_date: string;
    due_date?: string | null;
    notes?: string | null;
    is_overdue?: boolean;
    currency_code?: string;
    exchange_rate?: number;
    contact?: { id: number; name: string } | null;
    items?: BillItem[];
    payments?: BillPayment[];
    subtotal?: number;
    tax_total?: number;
    total?: number;
    base_total?: number;
    amount_paid?: number;
    amount_due?: number;
    transitions?: BillStatus[];
    attachments?: Attachment[];
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'cancelled';

export interface QuoteItem {
    id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    line_total?: number;
}

export interface Quote {
    id: number;
    number?: string;
    status: QuoteStatus;
    issue_date: string;
    expiry_date?: string;
    notes?: string;
    currency_code?: string;
    exchange_rate?: number;
    contact?: { id: number; name: string } | null;
    items?: QuoteItem[];
    subtotal?: number;
    tax_total?: number;
    total?: number;
    base_total?: number;
    transitions?: string[];
    created_by?: string;
    created_at?: string;
}

export type CreditNoteStatus = 'draft' | 'issued' | 'applied' | 'void';
export interface CreditNoteItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    line_total: number;
}
export interface CreditNote {
    id: number;
    reference: string;
    contact_id: number | null;
    original_invoice_id: number | null;
    original_bill_id: number | null;
    type: 'sale' | 'purchase';
    status: CreditNoteStatus;
    issue_date: string;
    currency_code: string;
    exchange_rate: number;
    subtotal: number;
    tax_total: number;
    total: number;
    amount_applied: number;
    amount_remaining: number;
    notes: string | null;
    contact?: Contact;
    invoice?: Invoice | null;
    bill?: Bill | null;
    items?: CreditNoteItem[];
    created_at: string;
}

export type SalesOrderStatus = 'draft' | 'confirmed' | 'fulfilled' | 'invoiced' | 'cancelled';
export interface SalesOrderItem {
    id?: number; product_id?: number | null; product_name?: string; product_sku?: string;
    description: string; quantity: number; unit_price: number; tax_rate: number;
    quantity_fulfilled?: number; line_total?: number;
    product?: { id: number; name: string; sku: string } | null;
}
export interface SalesOrder {
    id: number; number?: string; reference?: string | null; status: SalesOrderStatus;
    order_date: string; expected_date?: string | null; notes?: string | null;
    currency_code?: string; exchange_rate?: number;
    contact?: { id: number; name: string } | null;
    contact_id?: number | null;
    warehouse?: { id: number; name: string } | null;
    invoice?: { id: number; number?: string } | null;
    generated_invoice?: { id: number; number?: string } | null;
    items?: SalesOrderItem[]; subtotal?: number; tax_total?: number; total?: number;
    transitions?: string[]; created_by?: string; created_at?: string;
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type RecurringStatus = 'active' | 'paused' | 'ended';
export interface RecurringInvoiceItem {
    id?: number; description: string; quantity: number;
    unit_price: number; tax_rate: number; line_total?: number;
}
export interface RecurringInvoice {
    id: number; status: RecurringStatus; frequency: RecurringFrequency;
    reference_prefix?: string; interval?: number;
    start_date: string; next_run_date: string; end_date?: string;
    due_days: number; auto_send: boolean;
    currency_code?: string; exchange_rate?: number;
    notes?: string; last_generated_at?: string; generated_count: number;
    contact?: { id: number; name: string } | null;
    items?: RecurringInvoiceItem[]; subtotal?: number; tax_total?: number; total?: number;
    invoices?: Invoice[]; created_by?: string; created_at?: string;
}

export interface ExchangeRate {
    id: number;
    base_currency: string;
    quote_currency: string;
    from_currency: string;
    to_currency: string;
    rate: number;
    effective_date: string;
    is_active: boolean;
    source: string | null;
    created_at: string;
}

export interface BankAccount {
    id: number;
    name: string;
    account_number: string | null;
    bank_name: string | null;
    currency_code: string;
    opening_balance: number;
    balance?: number;
    unreconciled_count?: number;
}

export interface BankTransaction {
    id: number;
    bank_account_id: number;
    bank_account?: BankAccount;
    transaction_date: string;
    description: string | null;
    amount: number;
    reference: string | null;
    reconciled: boolean;
    payment_id: number | null;
    journal_entry_id: number | null;
    imported_at: string | null;
}

export interface ProjectTask {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    assigned_to: number | null;
    status: 'todo' | 'in_progress' | 'done' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    estimated_hours: number | null;
    actual_hours: number | null;
    is_overdue: boolean;
    assigned_to_user?: { id: number; name: string } | null;
}

export interface ProjectTimeEntry {
    id: number;
    project_id: number;
    task_id: number | null;
    user_id: number;
    description: string | null;
    hours: number;
    entry_date: string;
    is_billable: boolean;
    user?: { id: number; name: string };
    task?: ProjectTask | null;
}

export interface Project {
    id: number;
    name: string;
    description: string | null;
    contact_id: number | null;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    billing_type: 'fixed' | 'hourly' | 'non_billable';
    hourly_rate: number | null;
    total_hours: number;
    total_billed: number;
    completion_percent: number;
    contact?: { id: number; name: string } | null;
    tasks?: ProjectTask[];
    time_entries?: ProjectTimeEntry[];
    created_at: string;
}

export interface Attachment {
    id: number;
    filename: string;
    disk: string;
    path: string;
    mime_type: string | null;
    size: number | null;
    uploaded_by: number | null;
    uploader?: { id: number; name: string };
    created_at: string;
}

export interface BatchPaymentItem {
    id: number;
    payable_type: string;
    payable_id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference: string | null;
    batch_payment_id: number | null;
    invoice?: { id: number; number?: string };
}

export interface BatchPayment {
    id: number;
    reference: string;
    payment_date: string;
    payment_method: 'bank_transfer' | 'cheque' | 'cash' | 'card' | 'other';
    type: 'received' | 'made';
    total_amount: number;
    notes: string | null;
    payments_count?: number;
    payments?: BatchPaymentItem[];
    created_at: string;
}
export interface DeliveryNoteItem {
    id: number;
    product_id: number | null;
    description: string;
    quantity: number;
    product?: { id: number; name: string; sku: string } | null;
}

export interface DeliveryNote {
    id: number;
    reference: string;
    sales_order_id: number | null;
    invoice_id: number | null;
    contact_id: number | null;
    status: 'draft' | 'dispatched' | 'delivered';
    dispatch_date: string | null;
    delivery_date: string | null;
    carrier: string | null;
    tracking_number: string | null;
    notes: string | null;
    contact?: Contact | null;
    salesOrder?: SalesOrder | null;
    invoice?: Invoice | null;
    items?: DeliveryNoteItem[];
    created_at: string;
}

export interface VendorProfile {
    id: number | null;
    contact_id: number;
    credit_limit: number | null;
    payment_terms_days: number;
    preferred_currency: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_routing_number: string | null;
    notes: string | null;
    is_over_credit_limit: boolean;
}

export interface VendorEvaluation {
    id: number;
    contact_id: number;
    evaluated_by: number;
    evaluation_date: string;
    quality_rating: number;
    delivery_rating: number;
    price_rating: number;
    communication_rating: number;
    overall_rating: number;
    comments: string | null;
    evaluator?: { id: number; name: string };
    created_at: string;
}

export interface BudgetLine {
    id: number;
    budget_id: number;
    category: string;
    line_type: 'income' | 'expense';
    period_number: number;
    budgeted_amount: number;
    actual_amount: number;
    notes: string | null;
    variance: number;
    variance_percent: number;
    is_over_budget: boolean;
}

export interface Budget {
    id: number;
    name: string;
    fiscal_year: number;
    period_type: 'annual' | 'quarterly' | 'monthly';
    status: 'draft' | 'active' | 'closed';
    notes: string | null;
    lines_count?: number;
    total_budgeted: number;
    total_actual: number;
    total_variance: number;
    variance_percent: number;
    lines?: BudgetLine[];
}


export interface CustomerPortalToken {
    id: number;
    contact_id: number;
    email: string;
    expires_at: string | null;
    last_accessed_at: string | null;
    is_expired: boolean;
    portal_url?: string;
}

export interface DocumentTemplate {
    id: number;
    name: string;
    type: 'invoice' | 'quote' | 'letter' | 'receipt' | 'purchase_order';
    subject: string | null;
    body: string;
    variables: string[] | null;
    is_default: boolean;
    is_active: boolean;
    created_at: string;
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string | null;
    billing_cycle: 'monthly' | 'quarterly' | 'annually';
    price: number;
    currency_code: string;
    trial_days: number;
    is_active: boolean;
    subscriptions_count?: number;
    created_at: string;
}

export interface Subscription {
    id: number;
    contact_id: number;
    subscription_plan_id: number;
    status: 'trial' | 'active' | 'paused' | 'cancelled' | 'expired';
    started_at: string;
    trial_ends_at: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancelled_at: string | null;
    next_invoice_date: string | null;
    notes: string | null;
    contact?: Contact;
    plan?: SubscriptionPlan;
    created_at: string;
}
export interface CommissionRule {
    id: number;
    user_id: number;
    name: string;
    rate: number;
    type: 'percentage' | 'fixed';
    fixed_amount: number | null;
    is_active: boolean;
    user?: { id: number; name: string };
    created_at: string;
}

export interface Commission {
    id: number;
    commission_rule_id: number;
    user_id: number;
    invoice_id: number;
    invoice_amount: number;
    commission_amount: number;
    status: 'pending' | 'approved' | 'paid';
    approved_at: string | null;
    paid_at: string | null;
    notes: string | null;
    rule?: CommissionRule;
    user?: { id: number; name: string };
    invoice?: Invoice;
    created_at: string;
}

export interface ContractRenewal {
    id: number;
    contract_id: number;
    new_end_date: string;
    new_value: number | null;
    notes: string | null;
    renewed_by: number;
}

export interface Contract {
    id: number;
    contract_number: string | null;
    contact_id: number | null;
    title: string;
    party_name: string | null;
    party_email: string | null;
    reference: string | null;
    type: 'client' | 'vendor' | 'employee' | 'employment' | 'nda' | 'other';
    status: 'draft' | 'active' | 'expired' | 'terminated';
    value: number | null;
    currency: string | null;
    currency_code: string | null;
    start_date: string | null;
    end_date: string | null;
    auto_renew: boolean;
    renewal_notice_days: number;
    description: string | null;
    terms: string | null;
    notes: string | null;
    signed_at: string | null;
    terminated_at: string | null;
    is_expiring: boolean;
    is_expired: boolean;
    days_remaining: number;
    contact?: Contact;
    renewals?: ContractRenewal[];
    created_at: string;
}

export interface ReturnRequestItem {
    id: number;
    return_request_id: number;
    invoice_item_id: number | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    reason: string | null;
}

export interface ReturnRequest {
    id: number;
    tenant_id: number;
    invoice_id: number | null;
    contact_id: number | null;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    refund_amount: number;
    notes: string | null;
    approved_by: number | null;
    approved_at: string | null;
    refunded_at: string | null;
    total_requested: number;
    contact?: Contact;
    invoice?: { id: number; number: string } | null;
    approved_by_user?: { id: number; name: string } | null;
    items?: ReturnRequestItem[];
    created_at: string;
}

export interface TaxRate {
    id: number;
    name: string;
    rate: number;
    tax_type: 'sales' | 'purchase' | 'both';
    is_compound: boolean;
    is_active: boolean;
    account_id: number | null;
    created_at: string;
}

export interface TaxGroupItem {
    id: number;
    tax_group_id: number;
    tax_rate_id: number;
    tax_rate?: TaxRate;
}

export interface TaxGroup {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    total_rate?: number;
    items_count?: number;
    items?: TaxGroupItem[];
    created_at: string;
}

export interface ServiceAgreementItem {
    id: number;
    service_agreement_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export interface MaintenanceLog {
    id: number;
    service_agreement_id: number;
    technician_id: number | null;
    log_date: string;
    description: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    resolution: string | null;
    hours_spent: number | null;
    next_service_date: string | null;
    technician?: { id: number; name: string } | null;
}

export interface ServiceAgreement {
    id: number;
    contact_id: number | null;
    title: string;
    description: string | null;
    agreement_type: 'maintenance' | 'support' | 'sla' | 'retainer';
    status: 'draft' | 'active' | 'expired' | 'terminated';
    start_date: string | null;
    end_date: string | null;
    value: number | null;
    billing_cycle: 'monthly' | 'quarterly' | 'annually' | 'one_time';
    auto_renew: boolean;
    terms: string | null;
    signed_at: string | null;
    is_expired: boolean;
    is_expiring: boolean;
    days_remaining: number | null;
    contact?: { id: number; name: string } | null;
    service_items?: ServiceAgreementItem[];
    maintenance_logs?: MaintenanceLog[];
    created_at: string;
}

export interface LoyaltyTransaction {
    id: number;
    loyalty_enrollment_id: number;
    type: 'earn' | 'redeem' | 'adjustment' | 'expire';
    points: number;
    description: string | null;
    balance_after: number;
    created_at: string;
}

export interface LoyaltyEnrollment {
    id: number;
    loyalty_program_id: number;
    contact_id: number;
    points_balance: number;
    total_points_earned: number;
    total_points_redeemed: number;
    enrolled_at: string;
    tier_name: string | null;
    contact?: { id: number; name: string };
    transactions?: LoyaltyTransaction[];
}

export interface LoyaltyProgram {
    id: number;
    name: string;
    description: string | null;
    points_per_currency_unit: number;
    points_to_currency_rate: number;
    minimum_redemption_points: number;
    is_active: boolean;
    tier_config: Array<{ name: string; min_points: number; discount_percent: number }> | null;
    enrollments_count?: number;
    enrollments?: LoyaltyEnrollment[];
    created_at: string;
}

export interface LeadActivity {
    id: number;
    lead_id: number;
    user_id: number;
    type: 'call' | 'email' | 'meeting' | 'note' | 'task';
    description: string;
    activity_date: string;
    outcome: string | null;
    duration_minutes: number | null;
    user?: { id: number; name: string };
}

export interface Lead {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    source: 'website' | 'referral' | 'cold_call' | 'trade_show' | 'social_media' | 'other';
    stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
    assigned_to: number | null;
    estimated_value: number | null;
    probability: number;
    notes: string | null;
    lost_reason: string | null;
    won_at: string | null;
    lost_at: string | null;
    expected_close_date: string | null;
    weighted_value: number;
    assigned_to_user?: { id: number; name: string } | null;
    activities?: LeadActivity[];
    created_at: string;
}

export interface BankAccountV2 {
    id: number;
    name: string;
    bank_name: string;
    account_number: string | null;
    currency: string;
    opening_balance: number;
    current_balance: number;
    is_active: boolean;
}

export interface BankTransactionV2 {
    id: number;
    bank_account_id: number;
    transaction_date: string;
    description: string;
    amount: number;
    reference: string | null;
    type: 'credit' | 'debit';
    is_reconciled: boolean;
    reconciliation_id: number | null;
    account?: BankAccountV2;
}

export interface BankReconciliation {
    id: number;
    bank_account_id: number;
    statement_date: string;
    statement_balance: number;
    reconciled_balance: number;
    status: 'draft' | 'completed';
    notes: string | null;
    difference: number;
    is_balanced: boolean;
    account?: BankAccountV2;
    transactions?: BankTransactionV2[];
    completed_at: string | null;
}

export interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
    is_base: boolean;
    is_active: boolean;
}

export interface CurrencyExchangeRate {
    id: number;
    from_currency: string;
    to_currency: string;
    rate: number;
    effective_date: string;
    is_active: boolean;
}

export interface TicketComment {
    id: number;
    support_ticket_id: number;
    created_by: number;
    body: string;
    is_internal: boolean;
    created_at: string;
    created_by_user?: { id: number; name: string };
}

export interface SupportTicket {
    id: number;
    reference: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category: string | null;
    contact_id: number | null;
    assigned_to: number | null;
    created_by: number;
    resolved_at: string | null;
    closed_at: string | null;
    is_open: boolean;
    response_time_hours: number | null;
    assigned_to_user?: { id: number; name: string } | null;
    created_by_user?: { id: number; name: string };
    comments?: TicketComment[];
}

export interface ExpenseItem {
    id: number;
    expense_claim_id: number;
    category: string;
    expense_date: string;
    description: string;
    amount: number;
    receipt_url: string | null;
}

export interface ExpenseClaim {
    id: number;
    reference: string;
    submitted_by: number;
    approved_by: number | null;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
    claim_date: string;
    currency: string;
    total_amount: number;
    notes: string | null;
    is_editable: boolean;
    submitted_at: string | null;
    approved_at: string | null;
    paid_at: string | null;
    items?: ExpenseItem[];
}

export interface VendorBillItem {
    id: number;
    vendor_bill_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

export interface VendorBill {
    id: number;
    bill_number: string;
    status: string;
    bill_date: string;
    due_date: string | null;
    currency: string;
    subtotal: number;
    tax: number;
    total: number;
    is_overdue: boolean;
    is_open: boolean;
    items?: VendorBillItem[];
}

// Phase 103 — Credit Notes & Invoice Adjustments
export interface CreditNoteItemV2 {
    id: number;
    credit_note_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}
export interface CreditNoteV2 {
    id: number;
    credit_note_number: string;
    status: string;
    issue_date: string;
    currency: string;
    subtotal: number;
    tax: number;
    total: number;
    reason: string | null;
    is_available: boolean;
    is_open: boolean;
    items?: CreditNoteItemV2[];
}

export interface PaymentTerm {
    id: number;
    name: string;
    days: number;
    discount_days: number;
    discount_percent: number;
    description: string | null;
    is_active: boolean;
    has_early_discount: boolean;
    display_label: string;
}

// Phase 110 — Petty Cash Management
export interface PettyCashTransaction {
    id: number;
    fund_id: number;
    type: string;
    amount: number;
    description: string;
    transaction_date: string;
    is_debit: boolean;
}
export interface PettyCashFund {
    id: number;
    name: string;
    authorized_amount: number;
    current_balance: number;
    currency: string;
    is_active: boolean;
    is_low_balance: boolean;
    utilization_percent: number;
    transactions?: PettyCashTransaction[];
}

export interface BankTransfer {
    id: number;
    from_account_id: number;
    to_account_id: number;
    amount: number;
    currency: string;
    transfer_date: string;
    reference: string | null;
    status: string;
    is_pending: boolean;
    is_completed: boolean;
}

export interface CustomerGroup {
    id: number;
    name: string;
    description: string | null;
    discount_percent: number;
    credit_limit: number;
    currency: string;
    is_active: boolean;
    has_discount: boolean;
    member_count: number;
}

export interface AdvancePayment {
    id: number;
    contact_id: number | null;
    reference: string | null;
    amount: number;
    applied_amount: number;
    remaining_amount: number;
    currency: string;
    payment_date: string;
    status: string;
    is_available: boolean;
}

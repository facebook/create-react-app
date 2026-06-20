<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\CreditNote;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\JournalLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function trialBalance(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);

        $totals = JournalLine::select('account_id',
                DB::raw('SUM(debit) as total_debit'),
                DB::raw('SUM(credit) as total_credit')
            )
            ->whereHas('journalEntry', fn ($q) => $q->where('status', 'posted'))
            ->groupBy('account_id')
            ->get()
            ->keyBy('account_id');

        $accounts = Account::with('parent')
            ->orderBy('code')
            ->get()
            ->map(function (Account $account) use ($totals) {
                $row = $totals->get($account->id);
                return [
                    'id'           => $account->id,
                    'code'         => $account->code,
                    'name'         => $account->name,
                    'type'         => $account->type,
                    'parent_name'  => $account->parent?->name,
                    'total_debit'  => (float) ($row?->total_debit ?? 0),
                    'total_credit' => (float) ($row?->total_credit ?? 0),
                ];
            });

        return Inertia::render('Finance/Reports/TrialBalance', [
            'accounts'    => $accounts,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Reports'],
                ['label' => 'Trial Balance'],
            ],
        ]);
    }

    public function profitAndLoss(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);

        $from = $request->from ?? now()->startOfYear()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $totals = $this->aggregateJournalLines($from, $to);

        $accounts = Account::whereIn('type', ['income', 'expense'])
            ->orderBy('code')
            ->get();

        $revenue  = [];
        $expenses = [];

        foreach ($accounts as $account) {
            $row   = $totals->get($account->id);
            $debit  = (float) ($row?->total_debit  ?? 0);
            $credit = (float) ($row?->total_credit ?? 0);

            $net = $account->type === 'income'
                ? $credit - $debit
                : $debit - $credit;

            $entry = [
                'id'   => $account->id,
                'code' => $account->code,
                'name' => $account->name,
                'type' => $account->type,
                'net'  => $net,
            ];

            if ($account->type === 'income') {
                $revenue[] = $entry;
            } else {
                $expenses[] = $entry;
            }
        }

        $totalRevenue  = (float) array_sum(array_column($revenue, 'net'));
        $totalExpenses = (float) array_sum(array_column($expenses, 'net'));

        return Inertia::render('Finance/Reports/ProfitLoss', [
            'revenue'        => $revenue,
            'expenses'       => $expenses,
            'total_revenue'  => $totalRevenue,
            'total_expenses' => $totalExpenses,
            'net'            => $totalRevenue - $totalExpenses,
            'from'           => $from,
            'to'             => $to,
            'breadcrumbs'    => [
                ['label' => 'Finance'],
                ['label' => 'Reports'],
                ['label' => 'Profit & Loss'],
            ],
        ]);
    }

    public function balanceSheet(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);

        $asOf = $request->as_of ?? now()->toDateString();

        $totals = $this->aggregateJournalLines(null, $asOf);

        $accounts = Account::whereIn('type', ['asset', 'liability', 'equity'])
            ->orderBy('code')
            ->get();

        $assets      = [];
        $liabilities = [];
        $equity      = [];

        foreach ($accounts as $account) {
            $row    = $totals->get($account->id);
            $debit  = (float) ($row?->total_debit  ?? 0);
            $credit = (float) ($row?->total_credit ?? 0);

            $net = $account->type === 'asset'
                ? $debit - $credit
                : $credit - $debit;

            $entry = [
                'id'   => $account->id,
                'code' => $account->code,
                'name' => $account->name,
                'type' => $account->type,
                'net'  => $net,
            ];

            if ($account->type === 'asset') {
                $assets[] = $entry;
            } elseif ($account->type === 'liability') {
                $liabilities[] = $entry;
            } else {
                $equity[] = $entry;
            }
        }

        $totalAssets      = (float) array_sum(array_column($assets,      'net'));
        $totalLiabilities = (float) array_sum(array_column($liabilities, 'net'));
        $totalEquity      = (float) array_sum(array_column($equity,      'net'));

        return Inertia::render('Finance/Reports/BalanceSheet', [
            'assets'            => $assets,
            'liabilities'       => $liabilities,
            'equity'            => $equity,
            'total_assets'      => $totalAssets,
            'total_liabilities' => $totalLiabilities,
            'total_equity'      => $totalEquity,
            'as_of'             => $asOf,
            'breadcrumbs'       => [
                ['label' => 'Finance'],
                ['label' => 'Reports'],
                ['label' => 'Balance Sheet'],
            ],
        ]);
    }

    public function agedReceivables(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);
        $asOf = $request->as_of ?? now()->toDateString();

        $invoices = Invoice::with(['contact', 'items', 'payments'])
            ->whereNotIn('status', ['draft', 'paid', 'cancelled'])
            ->get()
            ->map(function ($inv) use ($asOf) {
                $daysOverdue = 0;
                if ($inv->due_date) {
                    $diff = \Carbon\Carbon::parse($asOf)->diffInDays($inv->due_date, false);
                    $daysOverdue = (int) max(0, $diff * -1);
                }
                $bucket = match(true) {
                    $daysOverdue === 0   => 'current',
                    $daysOverdue <= 30   => '1-30',
                    $daysOverdue <= 60   => '31-60',
                    $daysOverdue <= 90   => '61-90',
                    default              => '90+',
                };
                return [
                    'id'          => $inv->id,
                    'number'      => $inv->number,
                    'contact'     => $inv->contact?->name ?? '—',
                    'due_date'    => $inv->due_date?->toDateString(),
                    'amount_due'  => (float) $inv->amount_due,
                    'days_overdue'=> $daysOverdue,
                    'bucket'      => $bucket,
                ];
            });

        $bucketKeys = ['current', '1-30', '31-60', '61-90', '90+'];
        $totals = collect($bucketKeys)->mapWithKeys(fn ($k) =>
            [$k => (float) $invoices->where('bucket', $k)->sum('amount_due')]
        )->all();

        return Inertia::render('Finance/Reports/AgedReceivables', [
            'rows'        => $invoices->values(),
            'totals'      => $totals,
            'grand_total' => (float) $invoices->sum('amount_due'),
            'as_of'       => $asOf,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Reports'],
                ['label' => 'Aged Receivables'],
            ],
        ]);
    }

    public function agedPayables(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);
        $asOf = $request->as_of ?? now()->toDateString();

        $bills = Bill::with(['contact', 'items', 'payments'])
            ->whereNotIn('status', ['draft', 'paid', 'cancelled'])
            ->get()
            ->map(function ($bill) use ($asOf) {
                $daysOverdue = 0;
                if ($bill->due_date) {
                    $diff = \Carbon\Carbon::parse($asOf)->diffInDays($bill->due_date, false);
                    $daysOverdue = (int) max(0, $diff * -1);
                }
                $bucket = match(true) {
                    $daysOverdue === 0   => 'current',
                    $daysOverdue <= 30   => '1-30',
                    $daysOverdue <= 60   => '31-60',
                    $daysOverdue <= 90   => '61-90',
                    default              => '90+',
                };
                return [
                    'id'          => $bill->id,
                    'number'      => $bill->number,
                    'contact'     => $bill->contact?->name ?? '—',
                    'due_date'    => $bill->due_date?->toDateString(),
                    'amount_due'  => (float) $bill->amount_due,
                    'days_overdue'=> $daysOverdue,
                    'bucket'      => $bucket,
                ];
            });

        $bucketKeys = ['current', '1-30', '31-60', '61-90', '90+'];
        $totals = collect($bucketKeys)->mapWithKeys(fn ($k) =>
            [$k => (float) $bills->where('bucket', $k)->sum('amount_due')]
        )->all();

        return Inertia::render('Finance/Reports/AgedPayables', [
            'rows'        => $bills->values(),
            'totals'      => $totals,
            'grand_total' => (float) $bills->sum('amount_due'),
            'as_of'       => $asOf,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Reports'],
                ['label' => 'Aged Payables'],
            ],
        ]);
    }

    public function accountLedgerIndex(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);
        $accounts = Account::orderBy('code')->get(['id', 'code', 'name', 'type']);
        return Inertia::render('Finance/Reports/AccountLedger', [
            'accounts'    => $accounts,
            'account'     => null,
            'rows'        => [],
            'from'        => now()->startOfYear()->toDateString(),
            'to'          => now()->toDateString(),
            'breadcrumbs' => [['label' => 'Finance'], ['label' => 'Reports'], ['label' => 'Account Ledger']],
        ]);
    }

    public function accountLedger(Request $request, Account $account): Response
    {
        $this->authorize('viewAny', Account::class);
        $from = $request->from ?? now()->startOfYear()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        // Use JOIN (not whereHas) so ordering by journal_entries.date works correctly
        $lines = JournalLine::join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->where('journal_lines.account_id', $account->id)
            ->where('journal_entries.status', 'posted')
            ->when($from, fn ($q) => $q->whereDate('journal_entries.date', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('journal_entries.date', '<=', $to))
            ->orderBy('journal_entries.date')
            ->orderBy('journal_lines.id')
            ->select('journal_lines.*', 'journal_entries.date as entry_date',
                     'journal_entries.reference as entry_reference',
                     'journal_entries.description as entry_description')
            ->get();

        $isDebitNormal = in_array($account->type, ['asset', 'expense'], true);
        $runningBalance = 0.0;
        $rows = [];
        foreach ($lines as $line) {
            $debit  = (float) $line->debit;
            $credit = (float) $line->credit;
            $runningBalance += $isDebitNormal ? ($debit - $credit) : ($credit - $debit);
            $rows[] = [
                'id'          => $line->id,
                'date'        => $line->entry_date instanceof \Carbon\Carbon
                                  ? $line->entry_date->toDateString()
                                  : (string) $line->entry_date,
                'reference'   => $line->entry_reference,
                'description' => $line->description ?? $line->entry_description,
                'debit'       => $debit,
                'credit'      => $credit,
                'balance'     => $runningBalance,
            ];
        }

        $accounts = Account::orderBy('code')->get(['id', 'code', 'name', 'type']);

        return Inertia::render('Finance/Reports/AccountLedger', [
            'accounts'    => $accounts,
            'account'     => ['id' => $account->id, 'code' => $account->code, 'name' => $account->name, 'type' => $account->type],
            'rows'        => $rows,
            'from'        => $from,
            'to'          => $to,
            'breadcrumbs' => [
                ['label' => 'Finance'], ['label' => 'Reports'],
                ['label' => "Ledger: {$account->name}"],
            ],
        ]);
    }

    public function customerStatementIndex(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);

        $contactId = $request->get('contact_id');
        $from      = $request->get('from', now()->startOfMonth()->toDateString());
        $to        = $request->get('to', now()->toDateString());

        $contacts = Contact::customers()->orderBy('name')->get(['id', 'name', 'email']);

        if (!$contactId) {
            return Inertia::render('Finance/Reports/CustomerStatement', [
                'contacts'    => $contacts,
                'contact'     => null,
                'lines'       => [],
                'summary'     => null,
                'from'        => $from,
                'to'          => $to,
                'breadcrumbs' => [['label' => 'Finance'], ['label' => 'Reports'], ['label' => 'Customer Statement']],
            ]);
        }

        $contact = Contact::findOrFail($contactId);

        // Opening balance: sum of (total - amount_paid) for invoices before $from
        $priorInvoices = Invoice::with(['items', 'payments'])
            ->where('contact_id', $contactId)
            ->where('issue_date', '<', $from)
            ->whereNotIn('status', ['draft', 'cancelled'])
            ->get();

        $openingBalance = (float) $priorInvoices->sum(fn ($inv) => $inv->total - $inv->amount_paid);

        // All invoices within date range
        $invoices = Invoice::with(['items', 'payments'])
            ->where('contact_id', $contactId)
            ->whereBetween('issue_date', [$from, $to])
            ->whereNotIn('status', ['draft', 'cancelled'])
            ->orderBy('issue_date')
            ->get();

        $lines   = [];
        $balance = $openingBalance;

        foreach ($invoices as $inv) {
            $balance += $inv->total;
            $lines[] = [
                'date'      => $inv->issue_date instanceof \Carbon\Carbon ? $inv->issue_date->toDateString() : (string) $inv->issue_date,
                'type'      => 'Invoice',
                'reference' => $inv->number,
                'debit'     => $inv->total,
                'credit'    => 0,
                'balance'   => round($balance, 2),
                'status'    => $inv->status,
            ];

            if ($inv->amount_paid > 0) {
                $balance -= $inv->amount_paid;
                $lines[] = [
                    'date'      => $inv->issue_date instanceof \Carbon\Carbon ? $inv->issue_date->toDateString() : (string) $inv->issue_date,
                    'type'      => 'Payment',
                    'reference' => 'PMT-' . $inv->number,
                    'debit'     => 0,
                    'credit'    => $inv->amount_paid,
                    'balance'   => round($balance, 2),
                    'status'    => '',
                ];
            }
        }

        $summary = [
            'opening_balance' => round($openingBalance, 2),
            'total_invoiced'  => round($invoices->sum('total'), 2),
            'total_paid'      => round($invoices->sum('amount_paid'), 2),
            'closing_balance' => round($balance, 2),
        ];

        return Inertia::render('Finance/Reports/CustomerStatement', [
            'contacts'    => $contacts,
            'contact'     => $contact,
            'lines'       => $lines,
            'summary'     => $summary,
            'from'        => $from,
            'to'          => $to,
            'breadcrumbs' => [
                ['label' => 'Finance'], ['label' => 'Reports'],
                ['label' => "Statement: {$contact->name}"],
            ],
        ]);
    }

    public function customerStatement(Request $request, Contact $contact): Response
    {
        $this->authorize('viewAny', Account::class);

        $from = $request->from ?? now()->startOfYear()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $transactions = [];

        $invoices = Invoice::with(['items', 'payments'])
            ->where('contact_id', $contact->id)
            ->where('status', '!=', 'cancelled')
            ->whereDate('issue_date', '>=', $from)
            ->whereDate('issue_date', '<=', $to)
            ->get();

        foreach ($invoices as $invoice) {
            $transactions[] = [
                'date'      => $invoice->issue_date?->toDateString(),
                'type'      => 'Invoice',
                'reference' => $invoice->number,
                'debit'     => (float) $invoice->total,
                'credit'    => 0.0,
            ];
        }

        $paymentInvoices = Invoice::with('payments')
            ->where('contact_id', $contact->id)
            ->where('status', '!=', 'cancelled')
            ->get();

        foreach ($paymentInvoices as $invoice) {
            foreach ($invoice->payments as $payment) {
                $paymentDate = $payment->payment_date instanceof \Carbon\Carbon
                    ? $payment->payment_date->toDateString()
                    : (string) $payment->payment_date;

                if ($paymentDate < $from || $paymentDate > $to) {
                    continue;
                }

                $transactions[] = [
                    'date'      => $paymentDate,
                    'type'      => 'Payment',
                    'reference' => $invoice->number,
                    'debit'     => 0.0,
                    'credit'    => (float) $payment->amount,
                ];
            }
        }

        $creditNotes = CreditNote::with('items')
            ->where('contact_id', $contact->id)
            ->whereIn('status', ['issued', 'applied'])
            ->whereDate('issue_date', '>=', $from)
            ->whereDate('issue_date', '<=', $to)
            ->get();

        foreach ($creditNotes as $creditNote) {
            $transactions[] = [
                'date'      => $creditNote->issue_date?->toDateString(),
                'type'      => 'Credit Note',
                'reference' => $creditNote->number,
                'debit'     => 0.0,
                'credit'    => (float) $creditNote->total,
            ];
        }

        usort($transactions, fn ($a, $b) => strcmp((string) $a['date'], (string) $b['date']));

        $balance = 0.0;
        $totalDebit = 0.0;
        $totalCredit = 0.0;
        $rows = [];
        foreach ($transactions as $txn) {
            $balance += $txn['debit'] - $txn['credit'];
            $totalDebit += $txn['debit'];
            $totalCredit += $txn['credit'];
            $rows[] = array_merge($txn, ['balance' => $balance]);
        }

        return Inertia::render('Finance/Reports/CustomerStatement', [
            'contacts'        => Contact::customers()->orderBy('name')->get(['id', 'name']),
            'contact'         => ['id' => $contact->id, 'name' => $contact->name],
            'rows'            => $rows,
            'from'            => $from,
            'to'              => $to,
            'total_debit'     => $totalDebit,
            'total_credit'    => $totalCredit,
            'closing_balance' => $balance,
            'breadcrumbs'     => [
                ['label' => 'Finance'], ['label' => 'Reports'],
                ['label' => "Statement: {$contact->name}"],
            ],
        ]);
    }

    public function exportCustomerStatement(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Invoice::class);

        $contactId = $request->get('contact_id');
        $from      = $request->get('from', now()->startOfMonth()->toDateString());
        $to        = $request->get('to', now()->toDateString());

        abort_unless($contactId, 422, 'contact_id is required.');
        $contact = Contact::findOrFail($contactId);

        $priorInvoices = Invoice::with(['items', 'payments'])
            ->where('contact_id', $contactId)
            ->where('issue_date', '<', $from)
            ->whereNotIn('status', ['draft', 'cancelled'])
            ->get();

        $openingBalance = (float) $priorInvoices->sum(fn ($inv) => $inv->total - $inv->amount_paid);

        $invoices = Invoice::with(['items', 'payments'])
            ->where('contact_id', $contactId)
            ->whereBetween('issue_date', [$from, $to])
            ->whereNotIn('status', ['draft', 'cancelled'])
            ->orderBy('issue_date')
            ->get();

        $balance = $openingBalance;
        $rows    = [['Opening Balance', '', '', '', '', round($balance, 2)]];

        foreach ($invoices as $inv) {
            $balance += $inv->total;
            $issueDate = $inv->issue_date instanceof \Carbon\Carbon ? $inv->issue_date->toDateString() : (string) $inv->issue_date;
            $rows[] = [$issueDate, 'Invoice', $inv->number, $inv->total, 0, round($balance, 2)];
            if ($inv->amount_paid > 0) {
                $balance -= $inv->amount_paid;
                $rows[] = [$issueDate, 'Payment', 'PMT-' . $inv->number, 0, $inv->amount_paid, round($balance, 2)];
            }
        }

        $filename = "statement-{$contact->name}-{$from}-{$to}.csv";

        return $this->streamCsv(
            $filename,
            ['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance'],
            $rows
        );
    }

    public function vatReport(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $tenantId = $request->user()->tenant_id;
        $from     = $request->query('from', now()->startOfQuarter()->toDateString());
        $to       = $request->query('to',   now()->endOfQuarter()->toDateString());

        // Output VAT: tax collected on invoices (not cancelled) within the period
        $invoices = Invoice::where('tenant_id', $tenantId)
            ->whereNotIn('status', ['cancelled'])
            ->whereBetween('issue_date', [$from, $to])
            ->with('items')
            ->get();

        $outputLines = $invoices->map(function ($invoice) {
            $net = $invoice->subtotal;
            $tax = $invoice->tax_total;
            return [
                'id'      => $invoice->id,
                'number'  => $invoice->number,
                'date'    => $invoice->issue_date,
                'contact' => $invoice->contact?->name,
                'net'     => round($net, 2),
                'tax'     => round($tax, 2),
                'type'    => 'invoice',
            ];
        })->filter(fn ($line) => $line['tax'] != 0)->values();

        // Input VAT: tax paid on bills (not cancelled) within the period
        $bills = Bill::where('tenant_id', $tenantId)
            ->whereNotIn('status', ['cancelled'])
            ->whereBetween('issue_date', [$from, $to])
            ->with('items')
            ->get();

        $inputLines = $bills->map(function ($bill) {
            $net = $bill->subtotal;
            $tax = $bill->tax_total;
            return [
                'id'      => $bill->id,
                'number'  => $bill->number,
                'date'    => $bill->issue_date,
                'contact' => $bill->contact?->name,
                'net'     => round($net, 2),
                'tax'     => round($tax, 2),
                'type'    => 'bill',
            ];
        })->filter(fn ($line) => $line['tax'] != 0)->values();

        $totalOutputVat = round($outputLines->sum('tax'), 2);
        $totalInputVat  = round($inputLines->sum('tax'), 2);
        $netVat         = round($totalOutputVat - $totalInputVat, 2);

        return Inertia::render('Finance/Reports/VatReport', [
            'output_lines'     => $outputLines,
            'input_lines'      => $inputLines,
            'total_output_vat' => $totalOutputVat,
            'total_input_vat'  => $totalInputVat,
            'net_vat'          => $netVat,
            'from'             => $from,
            'to'               => $to,
        ]);
    }

    public function cashFlowForecast(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $weeks          = (int) $request->get('weeks', 12);
        $openingBalance = (float) $request->get('opening_balance', 0);
        $from           = now()->startOfDay();
        $to             = now()->addWeeks($weeks)->endOfDay();

        // Collect open invoices (inflows) due within horizon
        $invoices = Invoice::with('contact')
            ->whereIn('status', ['sent', 'partial'])
            ->whereBetween('due_date', [$from->toDateString(), $to->toDateString()])
            ->get();

        // Collect open bills (outflows) due within horizon
        $bills = Bill::with('contact')
            ->whereIn('status', ['received', 'partial'])
            ->whereBetween('due_date', [$from->toDateString(), $to->toDateString()])
            ->get();

        // Build weekly buckets
        $buckets = [];
        for ($i = 0; $i < $weeks; $i++) {
            $weekStart = now()->addWeeks($i)->startOfWeek()->toDateString();
            $weekEnd   = now()->addWeeks($i)->endOfWeek()->toDateString();
            $buckets[$weekStart] = [
                'week_start' => $weekStart,
                'week_end'   => $weekEnd,
                'inflows'    => [],
                'outflows'   => [],
            ];
        }

        // Place invoices into their week bucket
        foreach ($invoices as $inv) {
            $due = $inv->due_date instanceof \Carbon\Carbon
                ? $inv->due_date->toDateString()
                : (string) $inv->due_date;
            foreach ($buckets as $weekStart => $bucket) {
                if ($due >= $bucket['week_start'] && $due <= $bucket['week_end']) {
                    $buckets[$weekStart]['inflows'][] = [
                        'reference'   => $inv->reference,
                        'contact'     => $inv->contact?->name ?? '—',
                        'due_date'    => $due,
                        'amount'      => $inv->total - $inv->amount_paid,
                    ];
                    break;
                }
            }
        }

        // Place bills into their week bucket
        foreach ($bills as $bill) {
            $due = $bill->due_date instanceof \Carbon\Carbon
                ? $bill->due_date->toDateString()
                : (string) $bill->due_date;
            foreach ($buckets as $weekStart => $bucket) {
                if ($due >= $bucket['week_start'] && $due <= $bucket['week_end']) {
                    $buckets[$weekStart]['outflows'][] = [
                        'reference'   => $bill->reference,
                        'contact'     => $bill->contact?->name ?? '—',
                        'due_date'    => $due,
                        'amount'      => $bill->total - $bill->amount_paid,
                    ];
                    break;
                }
            }
        }

        // Compute running balance per week
        $balance = $openingBalance;
        $result  = [];
        foreach ($buckets as $bucket) {
            $inflow  = array_sum(array_column($bucket['inflows'],  'amount'));
            $outflow = array_sum(array_column($bucket['outflows'], 'amount'));
            $balance += $inflow - $outflow;
            $result[] = [
                'week_start'      => $bucket['week_start'],
                'week_end'        => $bucket['week_end'],
                'inflows'         => $bucket['inflows'],
                'outflows'        => $bucket['outflows'],
                'total_inflow'    => round($inflow, 2),
                'total_outflow'   => round($outflow, 2),
                'net'             => round($inflow - $outflow, 2),
                'closing_balance' => round($balance, 2),
            ];
        }

        return Inertia::render('Finance/Reports/CashFlowForecast', [
            'buckets'        => $result,
            'openingBalance' => $openingBalance,
            'weeks'          => $weeks,
            'totalInflow'    => round(array_sum(array_column($result, 'total_inflow')), 2),
            'totalOutflow'   => round(array_sum(array_column($result, 'total_outflow')), 2),
        ]);
    }

    public function exportCashFlowForecast(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Invoice::class);

        $weeks          = (int) $request->get('weeks', 12);
        $openingBalance = (float) $request->get('opening_balance', 0);
        $from           = now()->startOfDay();
        $to             = now()->addWeeks($weeks)->endOfDay();

        $invoices = Invoice::whereIn('status', ['sent', 'partial'])
            ->whereBetween('due_date', [$from->toDateString(), $to->toDateString()])->get();
        $bills    = Bill::whereIn('status', ['received', 'partial'])
            ->whereBetween('due_date', [$from->toDateString(), $to->toDateString()])->get();

        // Rebuild buckets same as above, minimal version for export
        $buckets = [];
        for ($i = 0; $i < $weeks; $i++) {
            $ws = now()->addWeeks($i)->startOfWeek()->toDateString();
            $we = now()->addWeeks($i)->endOfWeek()->toDateString();
            $buckets[$ws] = ['week_start' => $ws, 'week_end' => $we, 'inflow' => 0.0, 'outflow' => 0.0];
        }
        foreach ($invoices as $inv) {
            $due = $inv->due_date instanceof \Carbon\Carbon ? $inv->due_date->toDateString() : (string) $inv->due_date;
            foreach ($buckets as $ws => &$b) {
                if ($due >= $b['week_start'] && $due <= $b['week_end']) {
                    $b['inflow'] += $inv->total - $inv->amount_paid;
                    break;
                }
            }
        }
        foreach ($bills as $bill) {
            $due = $bill->due_date instanceof \Carbon\Carbon ? $bill->due_date->toDateString() : (string) $bill->due_date;
            foreach ($buckets as $ws => &$b) {
                if ($due >= $b['week_start'] && $due <= $b['week_end']) {
                    $b['outflow'] += $bill->total - $bill->amount_paid;
                    break;
                }
            }
        }

        $balance = $openingBalance;
        $rows = [];
        foreach ($buckets as $b) {
            $balance += $b['inflow'] - $b['outflow'];
            $rows[] = [
                $b['week_start'],
                $b['week_end'],
                round($b['inflow'], 2),
                round($b['outflow'], 2),
                round($b['inflow'] - $b['outflow'], 2),
                round($balance, 2),
            ];
        }

        return $this->streamCsv(
            'cash-flow-forecast.csv',
            ['Week Start', 'Week End', 'Inflows', 'Outflows', 'Net', 'Closing Balance'],
            $rows
        );
    }

    public function supplierStatement(Request $request): Response
    {
        $this->authorize('viewAny', Bill::class);

        $contactId = $request->get('contact_id');
        $from      = $request->get('from', now()->startOfMonth()->toDateString());
        $to        = $request->get('to', now()->toDateString());

        $contacts = Contact::vendors()->orderBy('name')->get(['id', 'name', 'email']);

        if (!$contactId) {
            return Inertia::render('Finance/Reports/SupplierStatement', [
                'contacts' => $contacts,
                'contact'  => null,
                'lines'    => [],
                'summary'  => null,
                'from'     => $from,
                'to'       => $to,
            ]);
        }

        $contact = Contact::findOrFail($contactId);

        // Opening balance: unpaid bill amounts before $from
        $openingBalance = (float) Bill::with(['items', 'payments'])
            ->where('contact_id', $contactId)
            ->where('issue_date', '<', $from)
            ->whereNotIn('status', ['draft', 'cancelled'])
            ->get()
            ->sum(fn ($b) => $b->total - $b->amount_paid);

        $bills = Bill::with(['items', 'payments'])
            ->where('contact_id', $contactId)
            ->whereBetween('issue_date', [$from, $to])
            ->whereNotIn('status', ['draft', 'cancelled'])
            ->orderBy('issue_date')
            ->get();

        $lines   = [];
        $balance = $openingBalance;

        foreach ($bills as $bill) {
            $balance += $bill->total;
            $lines[] = [
                'date'      => $bill->issue_date instanceof \Carbon\Carbon ? $bill->issue_date->toDateString() : (string) $bill->issue_date,
                'type'      => 'Bill',
                'reference' => $bill->number,
                'debit'     => $bill->total,
                'credit'    => 0,
                'balance'   => round($balance, 2),
                'status'    => $bill->status,
            ];

            if ($bill->amount_paid > 0) {
                $balance -= $bill->amount_paid;
                $lines[] = [
                    'date'      => $bill->issue_date instanceof \Carbon\Carbon ? $bill->issue_date->toDateString() : (string) $bill->issue_date,
                    'type'      => 'Payment',
                    'reference' => 'PMT-' . $bill->number,
                    'debit'     => 0,
                    'credit'    => $bill->amount_paid,
                    'balance'   => round($balance, 2),
                    'status'    => '',
                ];
            }
        }

        $summary = [
            'opening_balance' => round($openingBalance, 2),
            'total_billed'    => round($bills->sum('total'), 2),
            'total_paid'      => round($bills->sum('amount_paid'), 2),
            'closing_balance' => round($balance, 2),
        ];

        return Inertia::render('Finance/Reports/SupplierStatement', [
            'contacts' => $contacts,
            'contact'  => $contact,
            'lines'    => $lines,
            'summary'  => $summary,
            'from'     => $from,
            'to'       => $to,
        ]);
    }

    public function exportSupplierStatement(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Bill::class);

        $contactId = $request->get('contact_id');
        $from      = $request->get('from', now()->startOfMonth()->toDateString());
        $to        = $request->get('to', now()->toDateString());

        abort_unless($contactId, 422, 'contact_id is required.');
        $contact = Contact::findOrFail($contactId);

        $openingBalance = (float) Bill::with(['items', 'payments'])
            ->where('contact_id', $contactId)
            ->where('issue_date', '<', $from)
            ->whereNotIn('status', ['draft', 'cancelled'])
            ->get()
            ->sum(fn ($b) => $b->total - $b->amount_paid);

        $bills = Bill::with(['items', 'payments'])
            ->where('contact_id', $contactId)
            ->whereBetween('issue_date', [$from, $to])
            ->whereNotIn('status', ['draft', 'cancelled'])
            ->orderBy('issue_date')
            ->get();

        $balance = $openingBalance;
        $rows    = [['Opening Balance', '', '', '', '', round($balance, 2)]];

        foreach ($bills as $bill) {
            $balance += $bill->total;
            $rows[] = [(string)$bill->issue_date, 'Bill', $bill->number, $bill->total, 0, round($balance, 2)];
            if ($bill->amount_paid > 0) {
                $balance -= $bill->amount_paid;
                $rows[] = [(string)$bill->issue_date, 'Payment', 'PMT-' . $bill->number, 0, $bill->amount_paid, round($balance, 2)];
            }
        }

        $filename = "supplier-statement-{$contact->name}-{$from}-{$to}.csv";

        return $this->streamCsv(
            $filename,
            ['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance'],
            $rows
        );
    }

    public function comparativeProfitLoss(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);

        $currentFrom = $request->get('current_from', now()->startOfMonth()->toDateString());
        $currentTo   = $request->get('current_to',   now()->toDateString());
        $priorFrom   = $request->get('prior_from',   now()->subMonth()->startOfMonth()->toDateString());
        $priorTo     = $request->get('prior_to',     now()->subMonth()->endOfMonth()->toDateString());

        $buildSection = function (string $type, string $from, string $to): array {
            $totals = $this->aggregateJournalLines($from, $to);

            return Account::where('type', $type)
                ->orderBy('name')
                ->get()
                ->map(function (Account $account) use ($totals, $type) {
                    $row    = $totals->get($account->id);
                    $debit  = (float) ($row?->total_debit  ?? 0);
                    $credit = (float) ($row?->total_credit ?? 0);
                    $balance = $type === 'income'
                        ? $credit - $debit
                        : $debit - $credit;
                    return [
                        'id'      => $account->id,
                        'name'    => $account->name,
                        'code'    => $account->code ?? '',
                        'balance' => round($balance, 2),
                    ];
                })
                ->filter(fn ($row) => $row['balance'] != 0)
                ->values()
                ->toArray();
        };

        $currentIncome   = $buildSection('income',  $currentFrom, $currentTo);
        $currentExpenses = $buildSection('expense', $currentFrom, $currentTo);
        $priorIncome     = $buildSection('income',  $priorFrom,   $priorTo);
        $priorExpenses   = $buildSection('expense', $priorFrom,   $priorTo);

        // Merge account lists (union of both periods)
        $allIncomeIds  = collect(array_merge($currentIncome, $priorIncome))->pluck('id')->unique();
        $allExpenseIds = collect(array_merge($currentExpenses, $priorExpenses))->pluck('id')->unique();

        $indexBy = fn (array $rows) => collect($rows)->keyBy('id');

        $currentIncomeIdx  = $indexBy($currentIncome);
        $priorIncomeIdx    = $indexBy($priorIncome);
        $currentExpenseIdx = $indexBy($currentExpenses);
        $priorExpenseIdx   = $indexBy($priorExpenses);

        $mergeRows = function ($ids, $currentIdx, $priorIdx) {
            return $ids->map(function ($id) use ($currentIdx, $priorIdx) {
                $cur = $currentIdx->get($id);
                $pri = $priorIdx->get($id);
                return [
                    'id'      => $id,
                    'name'    => ($cur ?? $pri)['name'],
                    'code'    => ($cur ?? $pri)['code'],
                    'current' => $cur['balance'] ?? 0,
                    'prior'   => $pri['balance'] ?? 0,
                    'change'  => round(($cur['balance'] ?? 0) - ($pri['balance'] ?? 0), 2),
                ];
            })->sortBy('name')->values()->toArray();
        };

        $incomeRows  = $mergeRows($allIncomeIds,  $currentIncomeIdx,  $priorIncomeIdx);
        $expenseRows = $mergeRows($allExpenseIds, $currentExpenseIdx, $priorExpenseIdx);

        $totalCurrentIncome   = round(collect($incomeRows)->sum('current'), 2);
        $totalPriorIncome     = round(collect($incomeRows)->sum('prior'), 2);
        $totalCurrentExpenses = round(collect($expenseRows)->sum('current'), 2);
        $totalPriorExpenses   = round(collect($expenseRows)->sum('prior'), 2);

        return Inertia::render('Finance/Reports/ComparativeProfitLoss', [
            'incomeRows'           => $incomeRows,
            'expenseRows'          => $expenseRows,
            'totalCurrentIncome'   => $totalCurrentIncome,
            'totalPriorIncome'     => $totalPriorIncome,
            'totalCurrentExpenses' => $totalCurrentExpenses,
            'totalPriorExpenses'   => $totalPriorExpenses,
            'netCurrentProfit'     => round($totalCurrentIncome - $totalCurrentExpenses, 2),
            'netPriorProfit'       => round($totalPriorIncome - $totalPriorExpenses, 2),
            'currentFrom'          => $currentFrom,
            'currentTo'            => $currentTo,
            'priorFrom'            => $priorFrom,
            'priorTo'              => $priorTo,
        ]);
    }

    public function exportComparativeProfitLoss(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Account::class);

        $currentFrom = $request->get('current_from', now()->startOfMonth()->toDateString());
        $currentTo   = $request->get('current_to',   now()->toDateString());
        $priorFrom   = $request->get('prior_from',   now()->subMonth()->startOfMonth()->toDateString());
        $priorTo     = $request->get('prior_to',     now()->subMonth()->endOfMonth()->toDateString());

        $buildSection = function (string $type, string $from, string $to): array {
            $totals = $this->aggregateJournalLines($from, $to);

            return Account::where('type', $type)
                ->orderBy('name')
                ->get()
                ->map(function (Account $account) use ($totals, $type) {
                    $row    = $totals->get($account->id);
                    $debit  = (float) ($row?->total_debit  ?? 0);
                    $credit = (float) ($row?->total_credit ?? 0);
                    $balance = $type === 'income'
                        ? $credit - $debit
                        : $debit - $credit;
                    return [
                        'id'      => $account->id,
                        'name'    => $account->name,
                        'code'    => $account->code ?? '',
                        'balance' => round($balance, 2),
                    ];
                })
                ->filter(fn ($row) => $row['balance'] != 0)
                ->values()
                ->toArray();
        };

        $currentIncome   = $buildSection('income',  $currentFrom, $currentTo);
        $currentExpenses = $buildSection('expense', $currentFrom, $currentTo);
        $priorIncome     = $buildSection('income',  $priorFrom,   $priorTo);
        $priorExpenses   = $buildSection('expense', $priorFrom,   $priorTo);

        $allIncomeIds  = collect(array_merge($currentIncome, $priorIncome))->pluck('id')->unique();
        $allExpenseIds = collect(array_merge($currentExpenses, $priorExpenses))->pluck('id')->unique();

        $indexBy = fn (array $rows) => collect($rows)->keyBy('id');

        $currentIncomeIdx  = $indexBy($currentIncome);
        $priorIncomeIdx    = $indexBy($priorIncome);
        $currentExpenseIdx = $indexBy($currentExpenses);
        $priorExpenseIdx   = $indexBy($priorExpenses);

        $rows = [];

        foreach ($allIncomeIds as $id) {
            $cur  = $currentIncomeIdx->get($id);
            $pri  = $priorIncomeIdx->get($id);
            $name = ($cur ?? $pri)['name'];
            $code = ($cur ?? $pri)['code'];
            $rows[] = [
                'Income',
                $code,
                $name,
                number_format($cur['balance'] ?? 0, 2, '.', ''),
                number_format($pri['balance'] ?? 0, 2, '.', ''),
                number_format(($cur['balance'] ?? 0) - ($pri['balance'] ?? 0), 2, '.', ''),
            ];
        }

        foreach ($allExpenseIds as $id) {
            $cur  = $currentExpenseIdx->get($id);
            $pri  = $priorExpenseIdx->get($id);
            $name = ($cur ?? $pri)['name'];
            $code = ($cur ?? $pri)['code'];
            $rows[] = [
                'Expense',
                $code,
                $name,
                number_format($cur['balance'] ?? 0, 2, '.', ''),
                number_format($pri['balance'] ?? 0, 2, '.', ''),
                number_format(($cur['balance'] ?? 0) - ($pri['balance'] ?? 0), 2, '.', ''),
            ];
        }

        $totalCurrentIncome   = collect($currentIncome)->sum('balance');
        $totalPriorIncome     = collect($priorIncome)->sum('balance');
        $totalCurrentExpenses = collect($currentExpenses)->sum('balance');
        $totalPriorExpenses   = collect($priorExpenses)->sum('balance');

        $netCurrent = $totalCurrentIncome - $totalCurrentExpenses;
        $netPrior   = $totalPriorIncome - $totalPriorExpenses;
        $rows[] = ['Net Profit', '', '', number_format($netCurrent, 2, '.', ''), number_format($netPrior, 2, '.', ''), number_format($netCurrent - $netPrior, 2, '.', '')];

        return $this->streamCsv(
            "comparative-profit-loss-{$currentFrom}-{$currentTo}.csv",
            ['Section', 'Code', 'Account', 'Current Period', 'Prior Period', 'Change'],
            $rows
        );
    }

        // ─── CSV Export Methods ───────────────────────────────────────────────────

    public function exportProfitLoss(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Account::class);

        $from = $request->from ?? now()->startOfYear()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $totals   = $this->aggregateJournalLines($from, $to);
        $accounts = Account::whereIn('type', ['income', 'expense'])->orderBy('code')->get();

        $revenue  = [];
        $expenses = [];

        foreach ($accounts as $account) {
            $row    = $totals->get($account->id);
            $debit  = (float) ($row?->total_debit  ?? 0);
            $credit = (float) ($row?->total_credit ?? 0);
            $net    = $account->type === 'income' ? $credit - $debit : $debit - $credit;

            $entry = ['type' => $account->type === 'income' ? 'Revenue' : 'Expense', 'name' => $account->name, 'net' => $net];

            if ($account->type === 'income') {
                $revenue[] = $entry;
            } else {
                $expenses[] = $entry;
            }
        }

        $totalRevenue  = array_sum(array_column($revenue,  'net'));
        $totalExpenses = array_sum(array_column($expenses, 'net'));

        $rows = [];
        foreach ($revenue  as $r) { $rows[] = [$r['type'], $r['name'], number_format($r['net'], 2, '.', '')]; }
        foreach ($expenses as $r) { $rows[] = [$r['type'], $r['name'], number_format($r['net'], 2, '.', '')]; }
        $rows[] = ['Net', 'Net Profit / Loss', number_format($totalRevenue - $totalExpenses, 2, '.', '')];

        return $this->streamCsv(
            "profit-loss-{$from}-{$to}.csv",
            ['Type', 'Account', 'Amount'],
            $rows
        );
    }

    public function exportBalanceSheet(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Account::class);

        $asOf   = $request->as_of ?? now()->toDateString();
        $totals = $this->aggregateJournalLines(null, $asOf);

        $accounts = Account::whereIn('type', ['asset', 'liability', 'equity'])->orderBy('code')->get();

        $rows = [];
        foreach ($accounts as $account) {
            $row    = $totals->get($account->id);
            $debit  = (float) ($row?->total_debit  ?? 0);
            $credit = (float) ($row?->total_credit ?? 0);
            $net    = $account->type === 'asset' ? $debit - $credit : $credit - $debit;

            $section = ucfirst($account->type);
            $rows[]  = [$section, $account->name, number_format($net, 2, '.', '')];
        }

        return $this->streamCsv(
            "balance-sheet-{$asOf}.csv",
            ['Section', 'Account', 'Balance'],
            $rows
        );
    }

    public function exportAgedReceivables(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Account::class);

        $asOf = $request->as_of ?? now()->toDateString();

        $invoices = Invoice::with(['contact', 'items', 'payments'])
            ->whereNotIn('status', ['draft', 'paid', 'cancelled'])
            ->get();

        $rows = [];
        foreach ($invoices as $inv) {
            $daysOverdue = 0;
            if ($inv->due_date) {
                $diff        = \Carbon\Carbon::parse($asOf)->diffInDays($inv->due_date, false);
                $daysOverdue = (int) max(0, $diff * -1);
            }
            $bucket  = match (true) {
                $daysOverdue === 0  => 'current',
                $daysOverdue <= 30  => '1-30',
                $daysOverdue <= 60  => '31-60',
                $daysOverdue <= 90  => '61-90',
                default             => '90+',
            };
            $amountDue = (float) $inv->amount_due;
            $rows[] = [
                $inv->contact?->name ?? '—',
                $inv->number ?? '',
                $inv->issue_date?->toDateString() ?? '',
                $inv->due_date?->toDateString()   ?? '',
                $bucket === 'current' ? number_format($amountDue, 2, '.', '') : '0.00',
                $bucket === '1-30'    ? number_format($amountDue, 2, '.', '') : '0.00',
                $bucket === '31-60'   ? number_format($amountDue, 2, '.', '') : '0.00',
                $bucket === '61-90'   ? number_format($amountDue, 2, '.', '') : '0.00',
                $bucket === '90+'     ? number_format($amountDue, 2, '.', '') : '0.00',
                number_format($amountDue, 2, '.', ''),
            ];
        }

        return $this->streamCsv(
            "aged-receivables-{$asOf}.csv",
            ['Customer', 'Invoice #', 'Issue Date', 'Due Date', 'Current', '1-30', '31-60', '61-90', '90+', 'Total'],
            $rows
        );
    }

    public function exportAgedPayables(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Account::class);

        $asOf = $request->as_of ?? now()->toDateString();

        $bills = Bill::with(['contact', 'items', 'payments'])
            ->whereNotIn('status', ['draft', 'paid', 'cancelled'])
            ->get();

        $rows = [];
        foreach ($bills as $bill) {
            $daysOverdue = 0;
            if ($bill->due_date) {
                $diff        = \Carbon\Carbon::parse($asOf)->diffInDays($bill->due_date, false);
                $daysOverdue = (int) max(0, $diff * -1);
            }
            $bucket  = match (true) {
                $daysOverdue === 0  => 'current',
                $daysOverdue <= 30  => '1-30',
                $daysOverdue <= 60  => '31-60',
                $daysOverdue <= 90  => '61-90',
                default             => '90+',
            };
            $amountDue = (float) $bill->amount_due;
            $rows[] = [
                $bill->contact?->name ?? '—',
                $bill->number ?? '',
                $bill->issue_date?->toDateString() ?? '',
                $bill->due_date?->toDateString()   ?? '',
                $bucket === 'current' ? number_format($amountDue, 2, '.', '') : '0.00',
                $bucket === '1-30'    ? number_format($amountDue, 2, '.', '') : '0.00',
                $bucket === '31-60'   ? number_format($amountDue, 2, '.', '') : '0.00',
                $bucket === '61-90'   ? number_format($amountDue, 2, '.', '') : '0.00',
                $bucket === '90+'     ? number_format($amountDue, 2, '.', '') : '0.00',
                number_format($amountDue, 2, '.', ''),
            ];
        }

        return $this->streamCsv(
            "aged-payables-{$asOf}.csv",
            ['Vendor', 'Bill #', 'Issue Date', 'Due Date', 'Current', '1-30', '31-60', '61-90', '90+', 'Total'],
            $rows
        );
    }

    public function exportAccountLedger(Request $request, Account $account): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Account::class);

        $from = $request->from ?? now()->startOfYear()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $lines = JournalLine::join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->where('journal_lines.account_id', $account->id)
            ->where('journal_entries.status', 'posted')
            ->when($from, fn ($q) => $q->whereDate('journal_entries.date', '>=', $from))
            ->when($to,   fn ($q) => $q->whereDate('journal_entries.date', '<=', $to))
            ->orderBy('journal_entries.date')
            ->orderBy('journal_lines.id')
            ->select('journal_lines.*', 'journal_entries.date as entry_date',
                     'journal_entries.reference as entry_reference',
                     'journal_entries.description as entry_description')
            ->get();

        $isDebitNormal  = in_array($account->type, ['asset', 'expense'], true);
        $runningBalance = 0.0;
        $rows           = [];

        foreach ($lines as $line) {
            $debit  = (float) $line->debit;
            $credit = (float) $line->credit;
            $runningBalance += $isDebitNormal ? ($debit - $credit) : ($credit - $debit);
            $description = $line->description ?? $line->entry_description;
            $rows[] = [
                $line->entry_date instanceof \Carbon\Carbon
                    ? $line->entry_date->toDateString()
                    : (string) $line->entry_date,
                $description ?? '',
                number_format($debit,          2, '.', ''),
                number_format($credit,         2, '.', ''),
                number_format($runningBalance, 2, '.', ''),
            ];
        }

        return $this->streamCsv(
            "ledger-{$account->code}-{$from}-{$to}.csv",
            ['Date', 'Description', 'Debit', 'Credit', 'Balance'],
            $rows
        );
    }

    public function exportVatReport(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewAny', Invoice::class);

        $tenantId = $request->user()->tenant_id;
        $from     = $request->query('from', now()->startOfQuarter()->toDateString());
        $to       = $request->query('to',   now()->endOfQuarter()->toDateString());

        $invoices = Invoice::where('tenant_id', $tenantId)
            ->whereNotIn('status', ['cancelled'])
            ->whereBetween('issue_date', [$from, $to])
            ->with('items')
            ->get();

        $outputLines = $invoices->map(function ($invoice) {
            return [
                'number'  => $invoice->number,
                'date'    => $invoice->issue_date,
                'contact' => $invoice->contact?->name,
                'net'     => round((float) $invoice->subtotal, 2),
                'tax'     => round((float) $invoice->tax_total, 2),
                'type'    => 'Output',
            ];
        })->filter(fn ($l) => $l['tax'] != 0)->values();

        $bills = Bill::where('tenant_id', $tenantId)
            ->whereNotIn('status', ['cancelled'])
            ->whereBetween('issue_date', [$from, $to])
            ->with('items')
            ->get();

        $inputLines = $bills->map(function ($bill) {
            return [
                'number'  => $bill->number,
                'date'    => $bill->issue_date,
                'contact' => $bill->contact?->name,
                'net'     => round((float) $bill->subtotal, 2),
                'tax'     => round((float) $bill->tax_total, 2),
                'type'    => 'Input',
            ];
        })->filter(fn ($l) => $l['tax'] != 0)->values();

        $totalOutputVat = round($outputLines->sum('tax'), 2);
        $totalInputVat  = round($inputLines->sum('tax'),  2);
        $netVat         = round($totalOutputVat - $totalInputVat, 2);

        $rows = [];
        foreach ($outputLines as $line) {
            $date   = $line['date'] instanceof \Carbon\Carbon ? $line['date']->toDateString() : (string) $line['date'];
            $rows[] = [$line['type'], $line['number'] ?? '', $date, $line['contact'] ?? '', number_format($line['net'], 2, '.', ''), number_format($line['tax'], 2, '.', '')];
        }
        $rows[] = ['', '', '', '', '', ''];
        foreach ($inputLines as $line) {
            $date   = $line['date'] instanceof \Carbon\Carbon ? $line['date']->toDateString() : (string) $line['date'];
            $rows[] = [$line['type'], $line['number'] ?? '', $date, $line['contact'] ?? '', number_format($line['net'], 2, '.', ''), number_format($line['tax'], 2, '.', '')];
        }
        $rows[] = ['', '', '', '', '', ''];
        $rows[] = ['Total Output VAT', '', '', '', '', number_format($totalOutputVat, 2, '.', '')];
        $rows[] = ['Total Input VAT',  '', '', '', '', number_format($totalInputVat,  2, '.', '')];
        $rows[] = ['Net VAT',          '', '', '', '', number_format($netVat,          2, '.', '')];

        return $this->streamCsv(
            "vat-report-{$from}-{$to}.csv",
            ['Type', 'Document #', 'Date', 'Contact', 'Net', 'Tax'],
            $rows
        );
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function streamCsv(string $filename, array $headers, iterable $rows): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function aggregateJournalLines(?string $from = null, ?string $to = null): \Illuminate\Support\Collection
    {
        return JournalLine::select('account_id',
                DB::raw('SUM(debit) as total_debit'),
                DB::raw('SUM(credit) as total_credit')
            )
            ->whereHas('journalEntry', function ($q) use ($from, $to) {
                $q->where('status', 'posted');
                if ($from) $q->whereDate('date', '>=', $from);
                if ($to)   $q->whereDate('date', '<=', $to);
            })
            ->groupBy('account_id')
            ->get()
            ->keyBy('account_id');
    }
}

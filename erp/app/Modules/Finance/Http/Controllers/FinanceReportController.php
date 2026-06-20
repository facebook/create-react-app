<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FinanceReportController extends Controller
{
    // GET /finance/reports/profit-loss
    public function profitLoss(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $tenantId = app('tenant')->id;
        $dateFrom = $request->get('date_from', now()->startOfYear()->toDateString());
        $dateTo   = $request->get('date_to', now()->toDateString());

        // Revenue: sum payments for paid invoices
        $revenueRows = DB::table('invoices')
            ->join('payments', 'payments.invoice_id', '=', 'invoices.id')
            ->where('invoices.tenant_id', $tenantId)
            ->where('invoices.status', 'paid')
            ->whereNull('invoices.deleted_at')
            ->whereBetween('payments.payment_date', [$dateFrom, $dateTo])
            ->select(
                DB::raw('YEAR(payments.payment_date) as year'),
                DB::raw('MONTH(payments.payment_date) as month'),
                DB::raw('SUM(payments.amount) as revenue')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Expenses: sum bill payments for paid bills
        $expenseRows = DB::table('bills')
            ->join('bill_payments', 'bill_payments.bill_id', '=', 'bills.id')
            ->where('bills.tenant_id', $tenantId)
            ->where('bills.status', 'paid')
            ->whereNull('bills.deleted_at')
            ->whereBetween('bill_payments.payment_date', [$dateFrom, $dateTo])
            ->select(
                DB::raw('YEAR(bill_payments.payment_date) as year'),
                DB::raw('MONTH(bill_payments.payment_date) as month'),
                DB::raw('SUM(bill_payments.amount) as expenses')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->keyBy(fn ($r) => $r->year . '-' . $r->month);

        $totalRevenue  = (float) $revenueRows->sum('revenue');
        $totalExpenses = (float) $expenseRows->sum('expenses');
        $netProfit     = $totalRevenue - $totalExpenses;

        $breakdown = $revenueRows->map(function ($row) use ($expenseRows) {
            $key      = $row->year . '-' . $row->month;
            $expenses = (float) ($expenseRows->get($key)?->expenses ?? 0);
            $revenue  = (float) $row->revenue;
            $net      = $revenue - $expenses;
            $margin   = $revenue > 0 ? round($net / $revenue * 100, 2) : 0;
            return [
                'year'     => $row->year,
                'month'    => $row->month,
                'label'    => Carbon::createFromDate($row->year, $row->month, 1)->format('M Y'),
                'revenue'  => $revenue,
                'expenses' => $expenses,
                'net'      => $net,
                'margin'   => $margin,
            ];
        })->values();

        return Inertia::render('Finance/Reports/ProfitLossSummary', [
            'date_from'      => $dateFrom,
            'date_to'        => $dateTo,
            'total_revenue'  => $totalRevenue,
            'total_expenses' => $totalExpenses,
            'net_profit'     => $netProfit,
            'breakdown'      => $breakdown,
        ]);
    }

    // GET /finance/reports/aged-receivables
    public function agedReceivables(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $tenantId = app('tenant')->id;
        $asOf     = $request->get('as_of', now()->toDateString());
        $asOfDate = Carbon::parse($asOf);

        $invoices = Invoice::with(['contact', 'items', 'payments'])
            ->where('tenant_id', $tenantId)
            ->whereNotIn('status', ['draft', 'paid', 'cancelled'])
            ->get()
            ->map(function ($inv) use ($asOfDate) {
                $daysOverdue = 0;
                $bucket      = 'current';
                if ($inv->due_date) {
                    $diff        = $asOfDate->diffInDays($inv->due_date, false);
                    $daysOverdue = (int) max(0, $diff * -1);
                    $bucket      = match (true) {
                        $daysOverdue === 0 => 'current',
                        $daysOverdue <= 30 => '1-30',
                        $daysOverdue <= 60 => '31-60',
                        $daysOverdue <= 90 => '61-90',
                        default            => '91+',
                    };
                }
                return [
                    'id'           => $inv->id,
                    'number'       => $inv->number,
                    'customer'     => $inv->contact?->name ?? '—',
                    'due_date'     => $inv->due_date?->toDateString(),
                    'amount'       => (float) $inv->total,
                    'amount_due'   => (float) $inv->amount_due,
                    'days_overdue' => $daysOverdue,
                    'bucket'       => $bucket,
                ];
            });

        $bucketKeys = ['current', '1-30', '31-60', '61-90', '91+'];
        $totals     = collect($bucketKeys)->mapWithKeys(fn ($k) => [
            $k => (float) $invoices->where('bucket', $k)->sum('amount_due'),
        ])->all();

        return Inertia::render('Finance/Reports/AgedReceivablesSummary', [
            'rows'        => $invoices->values(),
            'totals'      => $totals,
            'grand_total' => (float) $invoices->sum('amount_due'),
            'as_of'       => $asOf,
        ]);
    }

    // GET /finance/reports/aged-payables
    public function agedPayables(Request $request): Response
    {
        $this->authorize('viewAny', Bill::class);

        $tenantId = app('tenant')->id;
        $asOf     = $request->get('as_of', now()->toDateString());
        $asOfDate = Carbon::parse($asOf);

        $bills = Bill::with(['contact', 'items', 'payments'])
            ->where('tenant_id', $tenantId)
            ->whereNotIn('status', ['draft', 'paid', 'cancelled'])
            ->get()
            ->map(function ($bill) use ($asOfDate) {
                $daysOverdue = 0;
                $bucket      = 'current';
                if ($bill->due_date) {
                    $diff        = $asOfDate->diffInDays($bill->due_date, false);
                    $daysOverdue = (int) max(0, $diff * -1);
                    $bucket      = match (true) {
                        $daysOverdue === 0 => 'current',
                        $daysOverdue <= 30 => '1-30',
                        $daysOverdue <= 60 => '31-60',
                        $daysOverdue <= 90 => '61-90',
                        default            => '91+',
                    };
                }
                return [
                    'id'           => $bill->id,
                    'number'       => $bill->number,
                    'supplier'     => $bill->contact?->name ?? '—',
                    'due_date'     => $bill->due_date?->toDateString(),
                    'amount'       => (float) $bill->total,
                    'amount_due'   => (float) $bill->amount_due,
                    'days_overdue' => $daysOverdue,
                    'bucket'       => $bucket,
                ];
            });

        $bucketKeys = ['current', '1-30', '31-60', '61-90', '91+'];
        $totals     = collect($bucketKeys)->mapWithKeys(fn ($k) => [
            $k => (float) $bills->where('bucket', $k)->sum('amount_due'),
        ])->all();

        return Inertia::render('Finance/Reports/AgedPayablesSummary', [
            'rows'        => $bills->values(),
            'totals'      => $totals,
            'grand_total' => (float) $bills->sum('amount_due'),
            'as_of'       => $asOf,
        ]);
    }

    // GET /finance/reports/invoice-summary
    public function invoiceSummary(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $tenantId = app('tenant')->id;
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo   = $request->get('date_to', now()->toDateString());

        $invoices = Invoice::with(['contact', 'items', 'payments'])
            ->where('tenant_id', $tenantId)
            ->whereBetween('issue_date', [$dateFrom, $dateTo])
            ->get();

        $statuses = ['draft', 'sent', 'partial', 'paid', 'cancelled'];

        $summary = collect($statuses)->mapWithKeys(function ($status) use ($invoices) {
            $group = $invoices->where('status', $status);
            return [$status => [
                'count'  => $group->count(),
                'amount' => (float) $group->sum(fn ($i) => $i->total),
            ]];
        })->all();

        // Overdue: sent/partial with due_date in the past
        $overdueInvoices = $invoices->filter(fn ($i) =>
            in_array($i->status, ['sent', 'partial']) &&
            $i->due_date !== null &&
            $i->due_date->isPast()
        );

        $summary['overdue'] = [
            'count'  => $overdueInvoices->count(),
            'amount' => (float) $overdueInvoices->sum(fn ($i) => $i->amount_due),
        ];

        $table = $invoices->map(fn ($inv) => [
            'id'        => $inv->id,
            'number'    => $inv->number,
            'customer'  => $inv->contact?->name ?? '—',
            'issue_date'=> $inv->issue_date?->toDateString(),
            'due_date'  => $inv->due_date?->toDateString(),
            'status'    => $inv->status,
            'total'     => (float) $inv->total,
            'amount_due'=> (float) $inv->amount_due,
        ])->values();

        return Inertia::render('Finance/Reports/InvoiceSummary', [
            'date_from'   => $dateFrom,
            'date_to'     => $dateTo,
            'summary'     => $summary,
            'total_count' => $invoices->count(),
            'total_amount'=> (float) $invoices->sum(fn ($i) => $i->total),
            'invoices'    => $table,
        ]);
    }

    // GET /finance/reports/expense-summary
    public function expenseSummary(Request $request): Response
    {
        $this->authorize('viewAny', Bill::class);

        $tenantId = app('tenant')->id;
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo   = $request->get('date_to', now()->toDateString());

        $bills = Bill::with(['contact', 'items', 'payments'])
            ->where('tenant_id', $tenantId)
            ->whereBetween('issue_date', [$dateFrom, $dateTo])
            ->get();

        $statuses = ['draft', 'received', 'partial', 'paid', 'cancelled'];

        $summary = collect($statuses)->mapWithKeys(function ($status) use ($bills) {
            $group = $bills->where('status', $status);
            return [$status => [
                'count'  => $group->count(),
                'amount' => (float) $group->sum(fn ($b) => $b->total),
            ]];
        })->all();

        $overdueBills = $bills->filter(fn ($b) =>
            in_array($b->status, ['received', 'partial']) &&
            $b->due_date !== null &&
            $b->due_date->isPast()
        );

        $summary['overdue'] = [
            'count'  => $overdueBills->count(),
            'amount' => (float) $overdueBills->sum(fn ($b) => $b->amount_due),
        ];

        $table = $bills->map(fn ($bill) => [
            'id'        => $bill->id,
            'number'    => $bill->number,
            'supplier'  => $bill->contact?->name ?? '—',
            'issue_date'=> $bill->issue_date?->toDateString(),
            'due_date'  => $bill->due_date?->toDateString(),
            'status'    => $bill->status,
            'total'     => (float) $bill->total,
            'amount_due'=> (float) $bill->amount_due,
        ])->values();

        return Inertia::render('Finance/Reports/ExpenseSummary', [
            'date_from'   => $dateFrom,
            'date_to'     => $dateTo,
            'summary'     => $summary,
            'total_count' => $bills->count(),
            'total_amount'=> (float) $bills->sum(fn ($b) => $b->total),
            'bills'       => $table,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Modules\CRM\Models\CrmLead;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\ExpenseClaim;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\Inventory\Models\Product;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExecutiveDashboardController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $now      = Carbon::now();

        // ── Financial KPIs ────────────────────────────────────────────────────

        // Monthly revenue: sum of paid invoice line-item totals this month
        $monthlyRevenue = Invoice::where('tenant_id', $tenantId)
            ->whereIn('status', ['paid', 'partial'])
            ->whereYear('issue_date', $now->year)
            ->whereMonth('issue_date', $now->month)
            ->with('items')
            ->get()
            ->sum(fn ($inv) => $inv->total);

        // Monthly expenses: approved/paid expense claims this month
        $monthlyExpenses = ExpenseClaim::where('tenant_id', $tenantId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereYear('claim_date', $now->year)
            ->whereMonth('claim_date', $now->month)
            ->sum('total_amount');

        // Outstanding invoices: status in (sent, partial, overdue)
        $outstandingInvoices = Invoice::where('tenant_id', $tenantId)
            ->whereIn('status', ['sent', 'partial'])
            ->with(['items', 'payments'])
            ->get();

        $outstandingInvoicesCount = $outstandingInvoices->count();
        $outstandingInvoicesTotal = $outstandingInvoices->sum(fn ($inv) => $inv->amount_due);

        // Overdue invoices: status=overdue OR (due_date < today AND not paid/cancelled/draft)
        $overdueInvoicesCount = Invoice::where('tenant_id', $tenantId)
            ->where(function ($q) use ($now) {
                $q->where(function ($sub) use ($now) {
                    $sub->whereNotIn('status', ['paid', 'cancelled', 'draft'])
                        ->where('due_date', '<', $now->startOfDay()->toDateString());
                });
            })
            ->count();

        // ── Operations KPIs ───────────────────────────────────────────────────

        // Low stock: products where stock_quantity <= reorder_point
        $lowStockCount = Product::where('tenant_id', $tenantId)
            ->whereColumn('stock_quantity', '<=', 'reorder_point')
            ->where('reorder_point', '>', 0)
            ->count();

        // Open purchase orders: bills with status draft or received (closest to "sent")
        $openPurchaseOrders = Bill::where('tenant_id', $tenantId)
            ->whereIn('status', ['draft', 'received'])
            ->count();

        // Active manufacturing orders
        $activeManufacturingOrders = ManufacturingOrder::where('tenant_id', $tenantId)
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->count();

        // ── People KPIs ───────────────────────────────────────────────────────

        $totalEmployees = Employee::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->count();

        $pendingLeaveRequests = LeaveRequest::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->count();

        $openHelpdeskTickets = HelpdeskTicket::where('tenant_id', $tenantId)
            ->whereIn('status', ['open', 'in_progress', 'pending'])
            ->count();

        // ── CRM KPIs ──────────────────────────────────────────────────────────

        $openLeads = CrmLead::where('tenant_id', $tenantId)
            ->where('type', 'lead')
            ->where('status', 'open')
            ->count();

        $openOpportunities = CrmLead::where('tenant_id', $tenantId)
            ->where('type', 'opportunity')
            ->where('status', 'open')
            ->count();

        $pipelineValue = CrmLead::where('tenant_id', $tenantId)
            ->where('type', 'opportunity')
            ->where('status', 'open')
            ->sum('expected_revenue');

        // ── Revenue Trend (last 6 months) ─────────────────────────────────────

        $revenueTrend = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date  = $now->copy()->subMonths($i);
            $rev   = Invoice::where('tenant_id', $tenantId)
                ->whereIn('status', ['paid', 'partial', 'sent'])
                ->whereYear('issue_date', $date->year)
                ->whereMonth('issue_date', $date->month)
                ->with('items')
                ->get()
                ->sum(fn ($inv) => $inv->total);

            $revenueTrend->push([
                'month'   => $date->format('M Y'),
                'revenue' => round($rev, 2),
            ]);
        }

        // ── Recent Activity ───────────────────────────────────────────────────

        $recentInvoices = Invoice::where('tenant_id', $tenantId)
            ->with('contact')
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($inv) => [
                'type'       => 'Invoice',
                'title'      => ($inv->number ?? 'INV') . ($inv->contact ? ' — ' . $inv->contact->name : ''),
                'status'     => $inv->status,
                'created_at' => $inv->created_at,
                'url'        => '/finance/invoices/' . $inv->id,
            ]);

        $recentLeads = CrmLead::where('tenant_id', $tenantId)
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($lead) => [
                'type'       => 'Lead',
                'title'      => $lead->title ?? ($lead->contact_name ?? 'Lead'),
                'status'     => $lead->status,
                'created_at' => $lead->created_at,
                'url'        => '/crm/leads/' . $lead->id,
            ]);

        $recentTickets = HelpdeskTicket::where('tenant_id', $tenantId)
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($t) => [
                'type'       => 'Ticket',
                'title'      => $t->subject ?? 'Ticket #' . $t->id,
                'status'     => $t->status,
                'created_at' => $t->created_at,
                'url'        => '/helpdesk/tickets/' . $t->id,
            ]);

        $recentOrders = ManufacturingOrder::where('tenant_id', $tenantId)
            ->latest()
            ->take(1)
            ->get()
            ->map(fn ($mo) => [
                'type'       => 'Order',
                'title'      => $mo->mo_number ?? 'MO #' . $mo->id,
                'status'     => $mo->status,
                'created_at' => $mo->created_at,
                'url'        => '/manufacturing/manufacturing-orders/' . $mo->id,
            ]);

        $recentActivity = $recentInvoices
            ->concat($recentLeads)
            ->concat($recentTickets)
            ->concat($recentOrders)
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->map(fn ($item) => array_merge($item, [
                'created_at' => $item['created_at'] ? $item['created_at']->toIso8601String() : null,
            ]));

        return Inertia::render('Dashboard/Executive', [
            // Financial
            'monthly_revenue'             => round($monthlyRevenue, 2),
            'monthly_expenses'            => round($monthlyExpenses, 2),
            'outstanding_invoices_count'  => $outstandingInvoicesCount,
            'outstanding_invoices_total'  => round($outstandingInvoicesTotal, 2),
            'overdue_invoices_count'      => $overdueInvoicesCount,
            // Operations
            'low_stock_count'             => $lowStockCount,
            'open_purchase_orders'        => $openPurchaseOrders,
            'active_manufacturing_orders' => $activeManufacturingOrders,
            // People
            'total_employees'             => $totalEmployees,
            'pending_leave_requests'      => $pendingLeaveRequests,
            'open_helpdesk_tickets'       => $openHelpdeskTickets,
            // CRM
            'open_leads'                  => $openLeads,
            'open_opportunities'          => $openOpportunities,
            'pipeline_value'              => round($pipelineValue, 2),
            // Charts
            'revenue_trend'               => $revenueTrend->values(),
            'recent_activity'             => $recentActivity,
        ]);
    }
}

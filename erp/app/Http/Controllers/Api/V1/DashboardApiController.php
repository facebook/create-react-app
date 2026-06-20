<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\CRM\Models\CrmLead;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use App\Modules\Inventory\Models\Product;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardApiController extends ApiController
{
    /**
     * GET /api/v1/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        $now       = now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd   = $now->copy()->endOfMonth();

        // Total revenue from paid invoices this month
        // total is a computed attribute (subtotal + tax), so sum via items join
        $paidInvoiceIds = Invoice::where('status', 'paid')
            ->whereBetween('issue_date', [$monthStart, $monthEnd])
            ->pluck('id');

        $totalRevenue = 0.0;
        if ($paidInvoiceIds->isNotEmpty()) {
            $totalRevenue = \App\Modules\Finance\Models\InvoiceItem::whereIn('invoice_id', $paidInvoiceIds)
                ->selectRaw('SUM(quantity * unit_price * (1 + COALESCE(tax_rate,0)/100)) as grand_total')
                ->value('grand_total') ?? 0.0;
        }

        // Open invoices
        $openInvoiceIds = Invoice::whereIn('status', ['draft', 'sent', 'partial'])->pluck('id');
        $openInvoicesCount = $openInvoiceIds->count();
        $openInvoicesTotal = 0.0;
        if ($openInvoiceIds->isNotEmpty()) {
            $openInvoicesTotal = \App\Modules\Finance\Models\InvoiceItem::whereIn('invoice_id', $openInvoiceIds)
                ->selectRaw('SUM(quantity * unit_price * (1 + COALESCE(tax_rate,0)/100)) as grand_total')
                ->value('grand_total') ?? 0.0;
        }

        // Open CRM leads
        $openLeadsCount = CrmLead::where('status', 'open')->count();

        // Open helpdesk tickets
        $openTicketsCount = HelpdeskTicket::whereIn('status', ['open', 'in_progress'])->count();

        // Low stock products (stock < reorder_point)
        $lowStockCount = Product::where('is_active', true)
            ->where('reorder_point', '>', 0)
            ->whereColumn('stock_quantity', '<', 'reorder_point')
            ->count();

        // Active manufacturing orders
        $activeMoCount = ManufacturingOrder::whereIn('status', ['confirmed', 'in_progress'])->count();

        return $this->success([
            'total_revenue'                   => (float) $totalRevenue,
            'open_invoices_count'             => $openInvoicesCount,
            'open_invoices_total'             => (float) $openInvoicesTotal,
            'open_leads_count'                => $openLeadsCount,
            'open_tickets_count'              => $openTicketsCount,
            'low_stock_products_count'        => $lowStockCount,
            'active_manufacturing_orders_count' => $activeMoCount,
        ]);
    }
}

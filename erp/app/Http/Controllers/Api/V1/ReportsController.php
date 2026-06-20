<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Bill;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;

class ReportsController extends ApiController
{
    public function financial(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $year = $request->integer('year', now()->year);

        $invoiceSummary = Invoice::where('tenant_id', $tenantId)
            ->whereYear('created_at', $year)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $monthlyRevenue = DB::table('invoices')
            ->join('invoice_items', 'invoices.id', '=', 'invoice_items.invoice_id')
            ->where('invoices.tenant_id', $tenantId)
            ->where('invoices.status', 'paid')
            ->whereYear('invoices.created_at', $year)
            ->selectRaw("strftime('%m', invoices.created_at) as month, SUM(invoice_items.quantity * invoice_items.unit_price) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $totalExpenses = DB::table('bills')
            ->join('bill_items', 'bills.id', '=', 'bill_items.bill_id')
            ->where('bills.tenant_id', $tenantId)
            ->whereYear('bills.created_at', $year)
            ->whereNull('bills.deleted_at')
            ->sum(DB::raw('bill_items.quantity * bill_items.unit_price'));

        return $this->success([
            'year'            => $year,
            'invoice_summary' => $invoiceSummary,
            'monthly_revenue' => $monthlyRevenue,
            'total_expenses'  => $totalExpenses ?? 0,
        ]);
    }

    public function inventory(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $stockStats = Product::where('tenant_id', $tenantId)
            ->selectRaw('COUNT(*) as total_products, SUM(stock_quantity * cost_price) as stock_value')
            ->first();

        $lowStock = Product::where('tenant_id', $tenantId)
            ->whereColumn('stock_quantity', '<=', 'reorder_point')
            ->where('reorder_point', '>', 0)
            ->count();

        $recentMovements = StockMovement::where('tenant_id', $tenantId)
            ->with('product:id,name,sku')
            ->latest()
            ->limit(10)
            ->get(['id', 'product_id', 'type', 'quantity', 'created_at']);

        return $this->success([
            'total_products'   => $stockStats?->total_products ?? 0,
            'stock_value'      => $stockStats?->stock_value ?? 0,
            'low_stock_count'  => $lowStock,
            'recent_movements' => $recentMovements,
        ]);
    }

    public function hr(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $headcount = Employee::where('tenant_id', $tenantId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $payrollSummary = PayrollRun::where('tenant_id', $tenantId)
            ->whereYear('created_at', now()->year)
            ->selectRaw('SUM(total_gross) as total_gross, SUM(total_net) as total_net, COUNT(*) as run_count')
            ->first();

        return $this->success([
            'headcount'       => $headcount,
            'payroll_summary' => $payrollSummary,
        ]);
    }
}

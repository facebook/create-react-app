<?php

namespace App\Http\Controllers;

use App\Modules\Finance\Models\Invoice;
use App\Modules\HR\Models\Department;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('Analytics/Index', [
            'revenue_by_month'   => $user->can('finance.view')   ? $this->revenueByMonth()   : [],
            'invoice_by_status'  => $user->can('finance.view')   ? $this->invoiceByStatus()  : [],
            'headcount_by_dept'  => $user->can('hr.view')        ? $this->headcountByDept()  : [],
            'payroll_summary'    => $user->can('hr.view')        ? $this->payrollSummary()   : [],
            'inventory_value'    => $user->can('inventory.view') ? $this->inventoryValue()   : null,
            'breadcrumbs'        => [['label' => 'Analytics', 'href' => route('analytics')]],
        ]);
    }

    private function revenueByMonth(): array
    {
        $paid = Invoice::where('status', 'paid')
            ->where('updated_at', '>=', now()->subMonths(12)->startOfMonth())
            ->with('items')
            ->get();

        return collect(range(11, 0))->map(function ($i) use ($paid) {
            $month    = now()->subMonths($i)->startOfMonth();
            $monthKey = $month->format('Y-m');

            $total = $paid
                ->filter(fn ($inv) => $inv->updated_at->format('Y-m') === $monthKey)
                ->sum(fn ($inv) => $inv->total);

            return ['label' => $month->format('M y'), 'value' => round((float) $total, 2)];
        })->values()->all();
    }

    private function invoiceByStatus(): array
    {
        $counts = Invoice::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return collect(['draft', 'sent', 'paid', 'cancelled'])->map(fn ($s) => [
            'label' => ucfirst($s),
            'value' => (int) ($counts[$s] ?? 0),
        ])->all();
    }

    private function headcountByDept(): array
    {
        return Department::withCount(['employees' => fn ($q) => $q->where('status', 'active')])
            ->get()
            ->map(fn ($d) => ['label' => $d->name, 'value' => $d->employees_count])
            ->sortByDesc('value')
            ->values()
            ->all();
    }

    private function payrollSummary(): array
    {
        return PayrollRun::with('items')
            ->latest('period_start')
            ->limit(6)
            ->get()
            ->map(fn ($run) => [
                'label' => $run->period_start->format('M Y'),
                'value' => round($run->total_net, 2),
            ])
            ->sortBy(fn ($r) => $r['label'])
            ->values()
            ->all();
    }

    private function inventoryValue(): array
    {
        $total = StockLevel::join('products', 'products.id', '=', 'stock_levels.product_id')
            ->selectRaw('SUM(stock_levels.quantity * products.cost_price) as total_value, COUNT(DISTINCT products.id) as product_count')
            ->first();

        $lowStock = StockLevel::join('products', 'products.id', '=', 'stock_levels.product_id')
            ->whereColumn('stock_levels.quantity', '<=', 'products.reorder_point')
            ->distinct('products.id')
            ->count('products.id');

        return [
            'total_value'   => round((float) ($total->total_value ?? 0), 2),
            'product_count' => (int) ($total->product_count ?? 0),
            'low_stock'     => $lowStock,
        ];
    }
}

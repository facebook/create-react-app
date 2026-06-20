<?php

namespace App\Jobs;

use App\Mail\ScheduledReportMail;
use App\Models\ReportSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Bill;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;

class SendScheduledReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly ReportSchedule $schedule) {}

    public function handle(): void
    {
        $data = match ($this->schedule->report_type) {
            'financial' => $this->buildFinancialReport(),
            'inventory' => $this->buildInventoryReport(),
            'hr'        => $this->buildHrReport(),
            default     => [],
        };

        foreach ($this->schedule->recipients as $email) {
            Mail::to($email)->send(new ScheduledReportMail($this->schedule, $data));
        }

        $this->schedule->update([
            'last_sent_at' => now(),
            'next_run_at'  => $this->schedule->computeNextRunAt(),
        ]);
    }

    private function buildFinancialReport(): array
    {
        $tenantId = $this->schedule->tenant_id;
        $year     = now()->year;

        $invoiceSummary = Invoice::where('tenant_id', $tenantId)
            ->whereYear('created_at', $year)
            ->selectRaw('SUM(total) as total_invoiced, SUM(CASE WHEN status = \'paid\' THEN total ELSE 0 END) as total_paid, SUM(CASE WHEN status != \'paid\' THEN total ELSE 0 END) as total_outstanding, SUM(CASE WHEN status != \'paid\' AND due_date < datetime(\'now\') THEN total ELSE 0 END) as total_overdue')
            ->first();

        $monthlyRevenue = DB::table('invoices')
            ->join('invoice_items', 'invoices.id', '=', 'invoice_items.invoice_id')
            ->where('invoices.tenant_id', $tenantId)
            ->where('invoices.status', 'paid')
            ->whereYear('invoices.created_at', $year)
            ->selectRaw("strftime('%m', invoices.created_at) as month, SUM(invoice_items.quantity * invoice_items.unit_price) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();

        return [
            'invoice_summary' => $invoiceSummary ? $invoiceSummary->toArray() : [],
            'monthly_revenue' => $monthlyRevenue,
        ];
    }

    private function buildInventoryReport(): array
    {
        $tenantId  = $this->schedule->tenant_id;
        $stockStats = Product::where('tenant_id', $tenantId)
            ->selectRaw('COUNT(*) as total_products, SUM(stock_quantity * cost_price) as stock_value')
            ->first();

        $lowStockCount = Product::where('tenant_id', $tenantId)
            ->whereColumn('stock_quantity', '<=', 'reorder_point')
            ->where('reorder_point', '>', 0)
            ->count();

        return [
            'total_products'  => $stockStats?->total_products ?? 0,
            'stock_value'     => $stockStats?->stock_value ?? 0,
            'low_stock_count' => $lowStockCount,
        ];
    }

    private function buildHrReport(): array
    {
        $tenantId = $this->schedule->tenant_id;

        $headcount = Employee::where('tenant_id', $tenantId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->toArray();

        $payrollSummary = PayrollRun::where('tenant_id', $tenantId)
            ->whereYear('created_at', now()->year)
            ->selectRaw('SUM(total_gross) as total_gross, SUM(total_net) as total_net, COUNT(*) as run_count')
            ->first();

        return [
            'headcount'       => $headcount,
            'payroll_summary' => $payrollSummary ? $payrollSummary->toArray() : [],
        ];
    }
}

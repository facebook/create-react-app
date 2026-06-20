<?php

namespace App\Http\Controllers;

use App\Modules\Finance\Models\Invoice;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Product;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function products(): StreamedResponse
    {
        Gate::authorize('viewAny', Product::class);

        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['SKU', 'Name', 'Category', 'Cost Price', 'Selling Price', 'Reorder Point', 'Active']);

            Product::with('category')->chunk(200, function ($products) use ($out) {
                foreach ($products as $p) {
                    fputcsv($out, [
                        $p->sku ?? '',
                        $p->name,
                        $p->category?->name ?? '',
                        $p->cost_price,
                        $p->sale_price,
                        $p->reorder_point,
                        $p->is_active ? 'Yes' : 'No',
                    ]);
                }
            });

            fclose($out);
        }, 'products-' . now()->format('Y-m-d') . '.csv', ['Content-Type' => 'text/csv']);
    }

    public function invoices(): StreamedResponse
    {
        Gate::authorize('viewAny', Invoice::class);

        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Number', 'Contact', 'Status', 'Issue Date', 'Due Date', 'Total', 'Amount Due']);

            Invoice::with(['contact', 'items', 'payments'])->chunk(200, function ($invoices) use ($out) {
                foreach ($invoices as $inv) {
                    fputcsv($out, [
                        $inv->number ?? '',
                        $inv->contact?->name ?? '',
                        $inv->status,
                        $inv->issue_date?->toDateString() ?? '',
                        $inv->due_date?->toDateString() ?? '',
                        $inv->total,
                        $inv->amount_due,
                    ]);
                }
            });

            fclose($out);
        }, 'invoices-' . now()->format('Y-m-d') . '.csv', ['Content-Type' => 'text/csv']);
    }

    public function employees(): StreamedResponse
    {
        // Export requires create permission (manager+) to protect sensitive salary data
        Gate::authorize('create', Employee::class);

        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Employee #', 'First Name', 'Last Name', 'Email', 'Position', 'Department', 'Type', 'Status', 'Start Date', 'Salary']);

            Employee::with('department')->chunk(200, function ($employees) use ($out) {
                foreach ($employees as $emp) {
                    fputcsv($out, [
                        $emp->employee_number ?? '',
                        $emp->first_name,
                        $emp->last_name,
                        $emp->email ?? '',
                        $emp->position ?? '',
                        $emp->department?->name ?? '',
                        $emp->employment_type,
                        $emp->status,
                        $emp->start_date?->toDateString() ?? '',
                        $emp->salary_amount,
                    ]);
                }
            });

            fclose($out);
        }, 'employees-' . now()->format('Y-m-d') . '.csv', ['Content-Type' => 'text/csv']);
    }
}

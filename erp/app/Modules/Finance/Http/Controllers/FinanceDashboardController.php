<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\Contact;
use Inertia\Inertia;
use Inertia\Response;

class FinanceDashboardController extends Controller
{
    public function index(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $openInvoices      = Invoice::where('tenant_id', $tenantId)->whereNotIn('status', ['paid', 'cancelled'])->count();
        $openInvoicesTotal = Invoice::where('tenant_id', $tenantId)->whereNotIn('status', ['paid', 'cancelled'])
            ->with(['items', 'payments'])->get()->sum(fn($i) => $i->amount_due);
        $overdueCount      = Invoice::where('tenant_id', $tenantId)->whereNotIn('status', ['paid', 'cancelled'])
            ->whereNotNull('due_date')->where('due_date', '<', now())->count();
        $unpaidBills       = Bill::where('tenant_id', $tenantId)->whereNotIn('status', ['paid', 'cancelled'])
            ->with(['items', 'payments'])->get()->sum(fn($b) => $b->amount_due);
        $totalContacts     = Contact::where('tenant_id', $tenantId)->count();
        $revenueThisMonth  = Invoice::where('tenant_id', $tenantId)->whereNotIn('status', ['cancelled'])
            ->whereYear('issue_date', now()->year)->whereMonth('issue_date', now()->month)
            ->with('items')->get()->sum(fn($i) => $i->total);

        $recentInvoices = Invoice::where('tenant_id', $tenantId)
            ->with(['contact', 'items', 'payments'])
            ->latest()
            ->take(6)
            ->get()
            ->map(fn($i) => [
                'id'         => $i->id,
                'number'     => $i->number,
                'contact'    => $i->contact?->name,
                'total'      => round($i->total, 2),
                'amount_due' => round($i->amount_due, 2),
                'status'     => $i->status,
                'issue_date' => $i->issue_date,
            ]);

        $recentBills = Bill::where('tenant_id', $tenantId)
            ->with(['items', 'payments'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($b) => [
                'id'         => $b->id,
                'status'     => $b->status,
                'total'      => round($b->total ?? 0, 2),
                'amount_due' => round($b->amount_due ?? 0, 2),
                'issue_date' => $b->issue_date,
            ]);

        return Inertia::render('Finance/Dashboard', compact(
            'openInvoices', 'openInvoicesTotal', 'overdueCount', 'unpaidBills',
            'totalContacts', 'revenueThisMonth', 'recentInvoices', 'recentBills'
        ));
    }
}

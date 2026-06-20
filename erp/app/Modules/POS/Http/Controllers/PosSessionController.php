<?php

namespace App\Modules\POS\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\POS\Models\PosSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosSessionController extends Controller
{
    public function index(): Response
    {
        $sessions = PosSession::with(['openedBy', 'closedBy', 'warehouse'])
            ->latest()
            ->paginate(20)
            ->through(fn ($s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'status'      => $s->status,
                'warehouse'   => $s->warehouse ? ['id' => $s->warehouse->id, 'name' => $s->warehouse->name] : null,
                'opened_by'   => $s->openedBy ? ['id' => $s->openedBy->id, 'name' => $s->openedBy->name] : null,
                'closed_by'   => $s->closedBy ? ['id' => $s->closedBy->id, 'name' => $s->closedBy->name] : null,
                'opened_at'   => $s->opened_at,
                'closed_at'   => $s->closed_at,
                'total_sales' => $s->total_sales,
            ]);

        return Inertia::render('POS/Sessions/Index', [
            'sessions' => $sessions,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('POS/Sessions/Create', [
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'         => 'nullable|string|max:255',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'opening_cash' => 'nullable|numeric|min:0',
        ]);

        $session = PosSession::create([
            'tenant_id'    => auth()->user()->tenant_id,
            'name'         => $data['name'] ?? 'Register',
            'warehouse_id' => $data['warehouse_id'] ?? null,
            'opened_by'    => auth()->id(),
            'status'       => 'open',
            'opened_at'    => now(),
            'opening_cash' => $data['opening_cash'] ?? 0,
        ]);

        $session->name = $session->generateName();
        $session->save();

        return redirect()->route('pos.sessions.show', $session);
    }

    public function show(PosSession $session): Response
    {
        $session->load(['openedBy', 'closedBy', 'warehouse']);

        $orders = $session->orders()
            ->with('servedBy')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn ($o) => [
                'id'             => $o->id,
                'receipt_number' => $o->receipt_number,
                'customer_name'  => $o->customer_name,
                'total'          => $o->total,
                'payment_method' => $o->payment_method,
                'status'         => $o->status,
                'created_at'     => $o->created_at,
            ]);

        $products = Product::where('is_active', true)
            ->get(['id', 'name', 'sku', 'sale_price']);

        return Inertia::render('POS/Sessions/Show', [
            'session'  => [
                'id'           => $session->id,
                'name'         => $session->name,
                'status'       => $session->status,
                'opened_at'    => $session->opened_at,
                'opening_cash' => $session->opening_cash,
                'total_sales'  => $session->total_sales,
                'warehouse'    => $session->warehouse ? ['id' => $session->warehouse->id, 'name' => $session->warehouse->name] : null,
                'opened_by'    => $session->openedBy ? ['id' => $session->openedBy->id, 'name' => $session->openedBy->name] : null,
            ],
            'products'     => $products,
            'recentOrders' => $orders,
        ]);
    }

    public function close(Request $request, PosSession $session): RedirectResponse
    {
        $data = $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'notes'        => 'nullable|string',
        ]);

        $session->closed_by = auth()->id();
        $session->save();

        $session->close((float) $data['closing_cash'], $data['notes'] ?? '');

        return redirect()->route('pos.sessions.index')
            ->with('success', 'Session closed successfully.');
    }

    public function zReport(PosSession $session): Response
    {
        $session->load(['openedBy', 'closedBy', 'warehouse']);

        $orders = $session->orders()
            ->where('status', 'completed')
            ->with('payments')
            ->get();

        $paymentBreakdown = $session->orders()
            ->where('status', 'completed')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total) as total')
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($r) => [
                'method' => $r->payment_method,
                'count'  => $r->count,
                'total'  => $r->total,
            ]);

        return Inertia::render('POS/Sessions/ZReport', [
            'session' => [
                'id'            => $session->id,
                'name'          => $session->name,
                'status'        => $session->status,
                'opened_at'     => $session->opened_at,
                'closed_at'     => $session->closed_at,
                'opening_cash'  => $session->opening_cash,
                'closing_cash'  => $session->closing_cash,
                'expected_cash' => $session->expected_cash,
                'total_sales'   => $session->total_sales,
                'total_refunds' => $session->total_refunds,
                'notes'         => $session->notes,
                'opened_by'     => $session->openedBy ? ['name' => $session->openedBy->name] : null,
                'closed_by'     => $session->closedBy ? ['name' => $session->closedBy->name] : null,
                'warehouse'     => $session->warehouse ? ['name' => $session->warehouse->name] : null,
            ],
            'orderCount'       => $orders->count(),
            'paymentBreakdown' => $paymentBreakdown,
        ]);
    }
}

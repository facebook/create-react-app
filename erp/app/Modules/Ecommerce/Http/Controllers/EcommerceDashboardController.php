<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\StoreOrder;
use App\Modules\Ecommerce\Models\StoreOrderItem;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EcommerceDashboardController extends Controller
{
    public function index(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $totalOrders = StoreOrder::where('tenant_id', $tenantId)->count();

        $ordersToday = StoreOrder::where('tenant_id', $tenantId)
            ->whereDate('created_at', today())
            ->count();

        $revenueToday = StoreOrder::where('tenant_id', $tenantId)
            ->whereDate('created_at', today())
            ->where('payment_status', 'paid')
            ->sum('total');

        $pendingOrders = StoreOrder::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->count();

        $topProducts = StoreOrderItem::select('product_name', DB::raw('SUM(quantity) as order_count'))
            ->whereHas('order', fn ($q) => $q->where('tenant_id', $tenantId))
            ->groupBy('product_name')
            ->orderByDesc('order_count')
            ->limit(5)
            ->get();

        $recentOrders = StoreOrder::where('tenant_id', $tenantId)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'id'             => $o->id,
                'order_number'   => $o->order_number,
                'customer_name'  => $o->customer_name,
                'total'          => $o->total,
                'status'         => $o->status,
                'payment_status' => $o->payment_status,
                'created_at'     => $o->created_at,
            ]);

        return Inertia::render('Ecommerce/Dashboard', [
            'stats' => [
                'total_orders'   => $totalOrders,
                'orders_today'   => $ordersToday,
                'revenue_today'  => (float) $revenueToday,
                'pending_orders' => $pendingOrders,
            ],
            'topProducts'  => $topProducts,
            'recentOrders' => $recentOrders,
        ]);
    }
}

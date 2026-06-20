<?php

namespace App\Modules\POS\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\POS\Models\PosOrder;
use App\Modules\POS\Models\PosSession;
use Inertia\Inertia;
use Inertia\Response;

class PosDashboardController extends Controller
{
    public function index(): Response
    {
        $openSessions = PosSession::where('status', 'open')->count();

        $todaySales = PosOrder::whereDate('created_at', today())
            ->where('status', 'completed')
            ->sum('total');

        $todayOrderCount = PosOrder::whereDate('created_at', today())
            ->where('status', 'completed')
            ->count();

        $avgOrderValue = $todayOrderCount > 0
            ? round($todaySales / $todayOrderCount, 2)
            : 0;

        $recentOrders = PosOrder::with(['session', 'servedBy'])
            ->latest()
            ->take(10)
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

        return Inertia::render('POS/Dashboard', [
            'stats' => [
                'open_sessions'   => $openSessions,
                'today_sales'     => $todaySales,
                'today_orders'    => $todayOrderCount,
                'avg_order_value' => $avgOrderValue,
            ],
            'recentOrders' => $recentOrders,
        ]);
    }
}

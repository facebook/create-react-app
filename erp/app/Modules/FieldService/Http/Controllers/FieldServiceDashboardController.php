<?php

namespace App\Modules\FieldService\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\FieldService\Models\ServiceOrder;
use Inertia\Inertia;
use Inertia\Response;

class FieldServiceDashboardController extends Controller
{
    public function index(): Response
    {
        $pendingCount = ServiceOrder::where('status', 'pending')->count();

        $inProgressCount = ServiceOrder::where('status', 'in_progress')->count();

        $completedTodayCount = ServiceOrder::where('status', 'completed')
            ->whereDate('completed_at', today())
            ->count();

        $overdueCount = ServiceOrder::where('scheduled_at', '<', now())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        // Orders by technician breakdown
        $technicianBreakdown = User::whereHas('assignedServiceOrders', function ($q) {
            $q->whereNotIn('status', ['completed', 'cancelled']);
        })
            ->withCount(['assignedServiceOrders as active_orders_count' => function ($q) {
                $q->whereNotIn('status', ['completed', 'cancelled']);
            }])
            ->orderByDesc('active_orders_count')
            ->get(['id', 'name']);

        $recentOrders = ServiceOrder::with('technician')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('FieldService/Dashboard', [
            'stats' => [
                'pending'        => $pendingCount,
                'inProgress'     => $inProgressCount,
                'completedToday' => $completedTodayCount,
                'overdue'        => $overdueCount,
            ],
            'technicianBreakdown' => $technicianBreakdown,
            'recentOrders'        => $recentOrders,
        ]);
    }
}

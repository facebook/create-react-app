<?php

namespace App\Modules\Manufacturing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\Manufacturing\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopFloorController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = ManufacturingOrder::with([
            'product',
            'workOrders.workCenter',
            'workOrders.productionSchedules' => fn ($q) => $q->orderByDesc('scheduled_start')->limit(1),
        ])
            ->where('status', 'in_progress')
            ->orderByDesc('start_date')
            ->get();

        return Inertia::render('Manufacturing/ShopFloor/Index', [
            'orders' => $orders,
        ]);
    }

    public function startWorkOrder(WorkOrder $workOrder): RedirectResponse
    {
        $workOrder->start();

        return back()->with('success', 'Work order started.');
    }

    public function finishWorkOrder(WorkOrder $workOrder): RedirectResponse
    {
        $workOrder->finish();

        return back()->with('success', 'Work order finished.');
    }
}

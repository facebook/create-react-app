<?php

namespace App\Modules\Manufacturing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\Manufacturing\Models\WorkCenter;
use App\Modules\Manufacturing\Models\WorkOrder;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ManufacturingDashboardController extends Controller
{
    public function index(): Response
    {
        $now       = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfWeek  = $now->copy()->startOfWeek();
        $endOfWeek    = $now->copy()->endOfWeek();

        $openMos = ManufacturingOrder::whereIn('status', ['draft', 'confirmed'])->count();
        $inProgressMos = ManufacturingOrder::where('status', 'in_progress')->count();

        $doneMos = ManufacturingOrder::where('status', 'done')
            ->where('finish_date', '>=', $startOfMonth->toDateString())
            ->count();

        $scheduledThisWeek = ManufacturingOrder::whereBetween('scheduled_date', [
            $startOfWeek->toDateString(), $endOfWeek->toDateString(),
        ])->count();

        $efficiencyData = ManufacturingOrder::where('status', 'done')
            ->where('finish_date', '>=', $startOfMonth->toDateString())
            ->where('qty_to_produce', '>', 0)
            ->get(['qty_produced', 'qty_to_produce']);

        $efficiency = $efficiencyData->isNotEmpty()
            ? round($efficiencyData->avg(fn ($mo) => ($mo->qty_produced / $mo->qty_to_produce) * 100), 1)
            : 0;

        $recentMos = ManufacturingOrder::with('product')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'mo_number', 'product_id', 'status', 'qty_to_produce', 'scheduled_date']);

        $workCenterUtilization = WorkCenter::withCount([
            'workOrders as open_work_orders_count' => fn ($q) => $q->whereIn('status', ['pending', 'in_progress']),
            'workOrders as done_work_orders_count'  => fn ($q) => $q->where('status', 'done'),
        ])->orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Manufacturing/Dashboard', [
            'stats' => [
                'openMos'           => $openMos,
                'inProgressMos'     => $inProgressMos,
                'doneMos'           => $doneMos,
                'scheduledThisWeek' => $scheduledThisWeek,
                'efficiency'        => $efficiency,
            ],
            'recentMos'              => $recentMos,
            'workCenterUtilization'  => $workCenterUtilization,
        ]);
    }
}

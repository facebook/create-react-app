<?php

namespace App\Modules\Fleet\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Fleet\Models\FuelLog;
use App\Modules\Fleet\Models\Vehicle;
use App\Modules\Fleet\Models\VehicleMaintenance;
use Inertia\Inertia;
use Inertia\Response;

class FleetDashboardController extends Controller
{
    public function index(): Response
    {
        $totalVehicles   = Vehicle::count();
        $activeVehicles  = Vehicle::where('status', 'active')->count();
        $inService       = Vehicle::where('status', 'in_service')->count();

        $monthlyFuelCost = FuelLog::whereYear('log_date', now()->year)
            ->whereMonth('log_date', now()->month)
            ->sum('total_cost');

        $expiringInsurance = Vehicle::whereNotNull('insurance_expiry')
            ->whereDate('insurance_expiry', '>', now())
            ->whereDate('insurance_expiry', '<=', now()->addDays(30))
            ->count();

        $upcomingMaintenances = VehicleMaintenance::where('status', 'scheduled')
            ->whereDate('due_date', '>=', now())
            ->whereDate('due_date', '<=', now()->addDays(30))
            ->count();

        $recentFuelLogs = FuelLog::with(['vehicle', 'driver'])
            ->orderByDesc('log_date')
            ->limit(5)
            ->get();

        return Inertia::render('Fleet/Dashboard', [
            'stats' => [
                'totalVehicles'        => $totalVehicles,
                'activeVehicles'       => $activeVehicles,
                'inService'            => $inService,
                'monthlyFuelCost'      => (float) $monthlyFuelCost,
                'expiringInsurance'    => $expiringInsurance,
                'upcomingMaintenances' => $upcomingMaintenances,
            ],
            'recentFuelLogs' => $recentFuelLogs,
        ]);
    }
}

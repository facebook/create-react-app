<?php

namespace App\Modules\Fleet\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Fleet\Models\FuelLog;
use App\Modules\Fleet\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FuelLogController extends Controller
{
    public function index(Request $request): Response
    {
        $fuelLogs = FuelLog::with(['vehicle', 'driver'])
            ->when($request->vehicle_id, fn ($q) => $q->where('vehicle_id', $request->vehicle_id))
            ->orderByDesc('log_date')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Fleet/FuelLogs/Index', [
            'fuelLogs' => $fuelLogs,
            'vehicles' => Vehicle::orderBy('name')->get(['id', 'name']),
            'filters'  => $request->only(['vehicle_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id'     => 'required|exists:fleet_vehicles,id',
            'log_date'       => 'required|date',
            'odometer_km'    => 'required|numeric|min:0',
            'liters'         => 'required|numeric|min:0',
            'cost_per_liter' => 'required|numeric|min:0',
            'total_cost'     => 'nullable|numeric|min:0',
            'fuel_type'      => 'nullable|string|max:50',
            'station'        => 'nullable|string|max:255',
            'driver_id'      => 'nullable|exists:users,id',
            'notes'          => 'nullable|string',
        ]);

        if (empty($validated['total_cost'])) {
            $validated['total_cost'] = round($validated['liters'] * $validated['cost_per_liter'], 2);
        }

        FuelLog::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->back()->with('success', 'Fuel log added.');
    }

    public function destroy(FuelLog $fuelLog): RedirectResponse
    {
        $fuelLog->delete();

        return redirect()->back()->with('success', 'Fuel log deleted.');
    }
}

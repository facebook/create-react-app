<?php

namespace App\Modules\Fleet\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Fleet\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(): Response
    {
        $vehicles = Vehicle::with('assignedDriver')
            ->withCount([
                'maintenances as due_soon_count' => function ($q) {
                    $q->where('status', 'scheduled')
                      ->whereDate('due_date', '>=', now())
                      ->whereDate('due_date', '<=', now()->addDays(30));
                },
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('Fleet/Vehicles/Index', [
            'vehicles' => $vehicles,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Fleet/Vehicles/Create', [
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'plate_number'        => 'nullable|string|max:50',
            'make'                => 'nullable|string|max:100',
            'model'               => 'nullable|string|max:100',
            'year'                => 'nullable|integer|min:1900|max:2100',
            'color'               => 'nullable|string|max:50',
            'vin'                 => 'nullable|string|max:50',
            'type'                => 'required|in:car,truck,van,motorcycle,other',
            'status'              => 'required|in:active,in_service,out_of_service,sold',
            'odometer_km'         => 'nullable|numeric|min:0',
            'fuel_type'           => 'required|in:petrol,diesel,electric,hybrid',
            'assigned_to'         => 'nullable|exists:users,id',
            'insurance_expiry'    => 'nullable|date',
            'registration_expiry' => 'nullable|date',
            'notes'               => 'nullable|string',
        ]);

        $vehicle = Vehicle::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->route('fleet.vehicles.show', $vehicle)->with('success', 'Vehicle created.');
    }

    public function show(Vehicle $vehicle): Response
    {
        $vehicle->load(['assignedDriver', 'fuelLogs.driver', 'maintenances', 'assignments.driver']);

        $recentFuelLogs = $vehicle->fuelLogs()
            ->with('driver')
            ->orderByDesc('log_date')
            ->limit(5)
            ->get();

        $upcomingMaintenances = $vehicle->maintenances()
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->orderBy('due_date')
            ->get();

        return Inertia::render('Fleet/Vehicles/Show', [
            'vehicle'              => $vehicle,
            'recentFuelLogs'       => $recentFuelLogs,
            'upcomingMaintenances' => $upcomingMaintenances,
            'users'                => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function edit(Vehicle $vehicle): Response
    {
        return Inertia::render('Fleet/Vehicles/Edit', [
            'vehicle' => $vehicle,
            'users'   => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'plate_number'        => 'nullable|string|max:50',
            'make'                => 'nullable|string|max:100',
            'model'               => 'nullable|string|max:100',
            'year'                => 'nullable|integer|min:1900|max:2100',
            'color'               => 'nullable|string|max:50',
            'vin'                 => 'nullable|string|max:50',
            'type'                => 'required|in:car,truck,van,motorcycle,other',
            'status'              => 'required|in:active,in_service,out_of_service,sold',
            'odometer_km'         => 'nullable|numeric|min:0',
            'fuel_type'           => 'required|in:petrol,diesel,electric,hybrid',
            'assigned_to'         => 'nullable|exists:users,id',
            'insurance_expiry'    => 'nullable|date',
            'registration_expiry' => 'nullable|date',
            'notes'               => 'nullable|string',
        ]);

        $vehicle->update($validated);

        return redirect()->route('fleet.vehicles.show', $vehicle)->with('success', 'Vehicle updated.');
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $vehicle->delete();

        return redirect()->route('fleet.vehicles.index')->with('success', 'Vehicle deleted.');
    }
}

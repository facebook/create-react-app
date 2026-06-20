<?php

namespace App\Modules\Fleet\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Fleet\Models\Vehicle;
use App\Modules\Fleet\Models\VehicleMaintenance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleMaintenanceController extends Controller
{
    public function index(Request $request): Response
    {
        $maintenances = VehicleMaintenance::with('vehicle')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->vehicle_id, fn ($q) => $q->where('vehicle_id', $request->vehicle_id))
            ->orderByDesc('service_date')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Fleet/Maintenances/Index', [
            'maintenances' => $maintenances,
            'vehicles'     => Vehicle::orderBy('name')->get(['id', 'name']),
            'filters'      => $request->only(['status', 'vehicle_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id'   => 'required|exists:fleet_vehicles,id',
            'type'         => 'required|in:scheduled,repair,inspection,other',
            'description'  => 'nullable|string',
            'vendor'       => 'nullable|string|max:255',
            'service_date' => 'required|date',
            'due_date'     => 'nullable|date',
            'odometer_km'  => 'nullable|numeric|min:0',
            'cost'         => 'nullable|numeric|min:0',
            'status'       => 'required|in:scheduled,in_progress,completed,cancelled',
            'notes'        => 'nullable|string',
        ]);

        VehicleMaintenance::create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Maintenance record added.');
    }

    public function complete(VehicleMaintenance $maintenance): RedirectResponse
    {
        $maintenance->complete();

        return redirect()->back()->with('success', 'Maintenance marked as completed.');
    }

    public function destroy(VehicleMaintenance $maintenance): RedirectResponse
    {
        $maintenance->delete();

        return redirect()->back()->with('success', 'Maintenance record deleted.');
    }
}

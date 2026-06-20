<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Vehicle;
use App\Modules\Inventory\Models\VehicleLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Vehicle::class);

        $vehicles = Vehicle::with(['assignedEmployee'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('registration')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/Vehicles/Index', [
            'vehicles'       => $vehicles,
            'filters'        => $request->only(['status']),
            'statusOptions'  => ['available', 'in_use', 'maintenance', 'retired'],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Vehicle::class);

        return Inertia::render('Inventory/Vehicles/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Vehicle::class);

        $validated = $request->validate([
            'registration'        => ['required', 'string', 'max:50', Rule::unique('vehicles')],
            'make'                => ['required', 'string', 'max:100'],
            'model'               => ['required', 'string', 'max:100'],
            'year'                => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'vin'                 => ['nullable', 'string', 'max:100'],
            'colour'              => ['nullable', 'string', 'max:50'],
            'fuel_type'           => ['nullable', Rule::in(['petrol', 'diesel', 'electric', 'hybrid'])],
            'odometer_km'         => ['nullable', 'numeric', 'min:0'],
            'status'              => ['nullable', Rule::in(['available', 'in_use', 'maintenance', 'retired'])],
            'insurance_expiry'    => ['nullable', 'date'],
            'registration_expiry' => ['nullable', 'date'],
            'notes'               => ['nullable', 'string'],
        ]);

        $vehicle = Vehicle::create([...$validated, 'tenant_id' => auth()->user()->tenant_id]);

        return redirect()->route('inventory.vehicles.show', $vehicle)
            ->with('success', 'Vehicle created successfully.');
    }

    public function show(Vehicle $vehicle): Response
    {
        $this->authorize('view', $vehicle);

        $vehicle->load(['logs', 'assignedEmployee']);

        return Inertia::render('Inventory/Vehicles/Show', [
            'vehicle' => $vehicle->append(['is_insurance_expiring', 'is_registration_expiring', 'total_distance']),
        ]);
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('delete', $vehicle);

        $vehicle->delete();

        return redirect()->route('inventory.vehicles.index')
            ->with('success', 'Vehicle deleted.');
    }

    public function assign(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('update', $vehicle);

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', Rule::exists('employees', 'id')],
        ]);

        $vehicle->assign($validated['employee_id']);

        return redirect()->back()->with('success', 'Vehicle assigned.');
    }

    public function unassign(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('update', $vehicle);

        $vehicle->unassign();

        return redirect()->back()->with('success', 'Vehicle unassigned.');
    }

    public function retire(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('update', $vehicle);

        $vehicle->retire();

        return redirect()->back()->with('success', 'Vehicle retired.');
    }

    public function addLog(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('update', $vehicle);

        $validated = $request->validate([
            'log_type'       => ['required', Rule::in(['trip', 'refuel', 'maintenance', 'inspection'])],
            'log_date'       => ['required', 'date'],
            'odometer_start' => ['nullable', 'numeric', 'min:0'],
            'odometer_end'   => ['nullable', 'numeric', 'min:0'],
            'distance_km'    => ['nullable', 'numeric', 'min:0'],
            'fuel_litres'    => ['nullable', 'numeric', 'min:0'],
            'cost'           => ['nullable', 'numeric', 'min:0'],
            'driver_name'    => ['nullable', 'string', 'max:255'],
            'destination'    => ['nullable', 'string', 'max:255'],
            'purpose'        => ['nullable', 'string', 'max:255'],
            'notes'          => ['nullable', 'string'],
        ]);

        if (isset($validated['odometer_end']) && $validated['odometer_end'] > $vehicle->odometer_km) {
            $vehicle->odometer_km = $validated['odometer_end'];
            $vehicle->save();
        }

        VehicleLog::create([...$validated, 'tenant_id' => auth()->user()->tenant_id, 'vehicle_id' => $vehicle->id]);

        return redirect()->back()->with('success', 'Log added.');
    }
}

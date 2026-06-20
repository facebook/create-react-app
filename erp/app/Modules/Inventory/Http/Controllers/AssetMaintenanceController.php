<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Asset;
use App\Modules\Inventory\Models\AssetMaintenance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AssetMaintenanceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AssetMaintenance::class);

        $maintenances = AssetMaintenance::with('asset')
            ->when($request->asset_id, fn ($q) => $q->where('asset_id', $request->asset_id))
            ->orderBy('scheduled_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventory/AssetMaintenances/Index', [
            'maintenances' => $maintenances,
            'filters'      => $request->only(['asset_id']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', AssetMaintenance::class);

        return Inertia::render('Inventory/AssetMaintenances/Create', [
            'assets' => Asset::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', AssetMaintenance::class);

        $validated = $request->validate([
            'asset_id'       => ['required', Rule::exists('assets', 'id')],
            'scheduled_date' => ['required', 'date'],
            'type'           => ['required', Rule::in(['routine', 'repair', 'inspection', 'calibration'])],
            'description'    => ['nullable', 'string'],
            'cost'           => ['nullable', 'numeric', 'min:0'],
            'performed_by'   => ['nullable', 'string', 'max:255'],
        ]);

        $maintenance = AssetMaintenance::create([...$validated, 'tenant_id' => auth()->user()->tenant_id]);

        return redirect()->route('inventory.asset-maintenances.show', $maintenance)
            ->with('success', 'Maintenance scheduled successfully.');
    }

    public function show(AssetMaintenance $assetMaintenance): Response
    {
        $this->authorize('view', $assetMaintenance);

        $assetMaintenance->load('asset');

        return Inertia::render('Inventory/AssetMaintenances/Show', [
            'maintenance' => $assetMaintenance,
        ]);
    }

    public function destroy(AssetMaintenance $assetMaintenance): RedirectResponse
    {
        $this->authorize('delete', $assetMaintenance);

        $assetMaintenance->delete();

        return redirect()->route('inventory.asset-maintenances.index')
            ->with('success', 'Maintenance record deleted.');
    }

    public function complete(Request $request, AssetMaintenance $assetMaintenance): RedirectResponse
    {
        $this->authorize('update', $assetMaintenance);

        $validated = $request->validate([
            'completed_date' => ['required', 'date'],
            'cost'           => ['nullable', 'numeric', 'min:0'],
        ]);

        $assetMaintenance->complete(
            $validated['completed_date'],
            isset($validated['cost']) ? (float) $validated['cost'] : null
        );

        return redirect()->back()
            ->with('success', 'Maintenance completed.');
    }
}

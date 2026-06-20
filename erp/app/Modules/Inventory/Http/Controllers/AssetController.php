<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\Inventory\Models\Asset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AssetController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Asset::class);

        $assets = Asset::withCount('maintenances')
            ->with('assignedEmployee')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventory/Assets/Index', [
            'assets'  => $assets,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Asset::class);

        $tenantId = auth()->user()->tenant_id;

        return Inertia::render('Inventory/Assets/Create', [
            'employees' => Employee::where('tenant_id', $tenantId)
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Asset::class);

        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'asset_code'    => ['nullable', 'string', 'max:100'],
            'category'      => ['nullable', 'string', 'max:100'],
            'location'      => ['nullable', 'string', 'max:255'],
            'purchase_date' => ['nullable', 'date'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'current_value' => ['nullable', 'numeric', 'min:0'],
            'serial_number' => ['nullable', 'string', 'max:100'],
            'status'        => ['required', Rule::in(['active', 'inactive', 'disposed', 'under_maintenance'])],
            'notes'         => ['nullable', 'string'],
        ]);

        $asset = Asset::create([...$validated, 'tenant_id' => auth()->user()->tenant_id]);

        return redirect()->route('inventory.assets.show', $asset)
            ->with('success', 'Asset created successfully.');
    }

    public function show(Asset $asset): Response
    {
        $this->authorize('view', $asset);

        $asset->load('assignedEmployee');
        $asset->setRelation('maintenances', $asset->maintenances()->latest('scheduled_date')->get());

        return Inertia::render('Inventory/Assets/Show', [
            'asset'     => $asset->append('depreciation'),
            'employees' => Employee::where('tenant_id', auth()->user()->tenant_id)
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name']),
        ]);
    }

    public function destroy(Asset $asset): RedirectResponse
    {
        $this->authorize('delete', $asset);

        $asset->delete();

        return redirect()->route('inventory.assets.index')
            ->with('success', 'Asset deleted.');
    }

    public function dispose(Asset $asset): RedirectResponse
    {
        $this->authorize('delete', $asset);

        $asset->dispose();

        return redirect()->back()
            ->with('success', 'Asset disposed.');
    }

    public function assign(Request $request, Asset $asset): RedirectResponse
    {
        $this->authorize('update', $asset);

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', Rule::exists('employees', 'id')],
        ]);

        $asset->assignTo($validated['employee_id']);

        return redirect()->back()
            ->with('success', 'Asset assigned.');
    }
}

<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\UnitOfMeasure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitOfMeasureController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', UnitOfMeasure::class);

        $query = UnitOfMeasure::query();

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $units = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Inventory/UnitsOfMeasure/Index', [
            'units' => $units,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', UnitOfMeasure::class);

        $validated = $request->validate([
            'name'              => 'required|string|max:100',
            'abbreviation'      => 'required|string|max:20',
            'type'              => 'nullable|string|max:50',
            'is_base'           => 'boolean',
            'conversion_factor' => 'nullable|numeric|min:0',
            'is_active'         => 'boolean',
        ]);

        $validated['tenant_id'] = app('tenant')->id;

        UnitOfMeasure::create($validated);

        return back();
    }

    public function show(UnitOfMeasure $unitsOfMeasure): Response
    {
        $this->authorize('view', $unitsOfMeasure);

        return Inertia::render('Inventory/UnitsOfMeasure/Show', [
            'unit' => $unitsOfMeasure,
        ]);
    }

    public function update(Request $request, UnitOfMeasure $unitsOfMeasure): RedirectResponse
    {
        $this->authorize('update', $unitsOfMeasure);

        $validated = $request->validate([
            'name'              => 'required|string|max:100',
            'abbreviation'      => 'required|string|max:20',
            'type'              => 'nullable|string|max:50',
            'is_base'           => 'boolean',
            'conversion_factor' => 'nullable|numeric|min:0',
            'is_active'         => 'boolean',
        ]);

        $unitsOfMeasure->update($validated);

        return back();
    }

    public function destroy(UnitOfMeasure $unitsOfMeasure): RedirectResponse
    {
        $this->authorize('delete', $unitsOfMeasure);

        $unitsOfMeasure->delete();

        return redirect()->route('inventory.units-of-measure.index');
    }
}

<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\SupplierScorecard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierScorecardController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SupplierScorecard::class);

        $scorecards = SupplierScorecard::latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/SupplierScorecards/Index', [
            'scorecards' => $scorecards,
            'filters'    => $request->only(['supplier_name', 'period', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SupplierScorecard::class);

        return Inertia::render('Inventory/SupplierScorecards/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', SupplierScorecard::class);

        $validated = $request->validate([
            'supplier_name'  => 'required|string',
            'period'         => 'required|string',
            'supplier_code'  => 'nullable|string',
            'quality_score'  => 'nullable|numeric|min:0|max:100',
            'delivery_score' => 'nullable|numeric|min:0|max:100',
            'pricing_score'  => 'nullable|numeric|min:0|max:100',
            'service_score'  => 'nullable|numeric|min:0|max:100',
            'notes'          => 'nullable|string',
        ]);

        $validated['tenant_id'] = app('tenant')->id;

        SupplierScorecard::create($validated);

        return redirect()->route('inventory.supplier-scorecards.index')
            ->with('success', 'Supplier scorecard created.');
    }

    public function show(SupplierScorecard $supplierScorecard): Response
    {
        $this->authorize('view', $supplierScorecard);

        return Inertia::render('Inventory/SupplierScorecards/Show', [
            'scorecard' => $supplierScorecard,
        ]);
    }

    public function edit(SupplierScorecard $supplierScorecard): Response
    {
        $this->authorize('update', $supplierScorecard);

        return Inertia::render('Inventory/SupplierScorecards/Edit', [
            'scorecard' => $supplierScorecard,
        ]);
    }

    public function update(Request $request, SupplierScorecard $supplierScorecard): RedirectResponse
    {
        $this->authorize('update', $supplierScorecard);

        $validated = $request->validate([
            'supplier_name'  => 'required|string',
            'period'         => 'required|string',
            'supplier_code'  => 'nullable|string',
            'quality_score'  => 'nullable|numeric|min:0|max:100',
            'delivery_score' => 'nullable|numeric|min:0|max:100',
            'pricing_score'  => 'nullable|numeric|min:0|max:100',
            'service_score'  => 'nullable|numeric|min:0|max:100',
            'notes'          => 'nullable|string',
        ]);

        $supplierScorecard->update($validated);

        return redirect()->route('inventory.supplier-scorecards.index')
            ->with('success', 'Supplier scorecard updated.');
    }

    public function publish(SupplierScorecard $supplierScorecard): RedirectResponse
    {
        $this->authorize('publish', $supplierScorecard);

        $supplierScorecard->publish(auth()->id());

        return redirect()->route('inventory.supplier-scorecards.index')
            ->with('success', 'Supplier scorecard published.');
    }

    public function destroy(SupplierScorecard $supplierScorecard): RedirectResponse
    {
        $this->authorize('delete', $supplierScorecard);

        $supplierScorecard->delete();

        return redirect()->route('inventory.supplier-scorecards.index')
            ->with('success', 'Supplier scorecard deleted.');
    }
}

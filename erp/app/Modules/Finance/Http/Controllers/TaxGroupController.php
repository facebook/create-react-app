<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\TaxGroup;
use App\Modules\Finance\Models\TaxGroupItem;
use App\Modules\Finance\Models\TaxRate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaxGroupController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', TaxGroup::class);

        $taxGroups = TaxGroup::withCount('items')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Finance/TaxGroups/Index', [
            'taxGroups' => $taxGroups,
        ]);
    }

    public function create(): Response
    {
        $taxRates = TaxRate::active()->orderBy('name')->get();

        return Inertia::render('Finance/TaxGroups/Create', [
            'taxRates' => $taxRates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', TaxGroup::class);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $taxGroup = TaxGroup::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->route('finance.tax-groups.show', $taxGroup)
            ->with('success', 'Tax group created successfully.');
    }

    public function show(TaxGroup $taxGroup): Response
    {
        $taxGroup->load('items.taxRate');

        return Inertia::render('Finance/TaxGroups/Show', [
            'taxGroup' => $taxGroup->append('total_rate'),
        ]);
    }

    public function destroy(TaxGroup $taxGroup): RedirectResponse
    {
        $this->authorize('delete', $taxGroup);

        $taxGroup->delete();

        return redirect()->route('finance.tax-groups.index')
            ->with('success', 'Tax group deleted successfully.');
    }

    public function addRate(Request $request, TaxGroup $taxGroup): RedirectResponse
    {
        $this->authorize('create', $taxGroup);

        $validated = $request->validate([
            'tax_rate_id' => ['required', 'exists:tax_rates,id'],
        ]);

        TaxGroupItem::updateOrCreate(
            [
                'tax_group_id' => $taxGroup->id,
                'tax_rate_id'  => $validated['tax_rate_id'],
            ],
            [
                'tenant_id' => auth()->user()->tenant_id,
            ]
        );

        return redirect()->back()->with('success', 'Tax rate added to group.');
    }

    public function removeRate(TaxGroup $taxGroup, TaxGroupItem $item): RedirectResponse
    {
        $this->authorize('delete', $taxGroup);

        $item->delete();

        return redirect()->back()->with('success', 'Tax rate removed from group.');
    }
}

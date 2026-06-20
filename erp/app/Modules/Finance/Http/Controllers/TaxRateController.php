<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\TaxRate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaxRateController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', TaxRate::class);

        $taxRates = TaxRate::when($request->tax_type, fn ($q) => $q->where('tax_type', $request->tax_type))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Finance/TaxRates/Index', [
            'taxRates' => $taxRates,
            'filters'  => $request->only(['tax_type']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Finance/TaxRates/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', TaxRate::class);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'rate'        => ['required', 'numeric', 'min:0', 'max:100'],
            'tax_type'    => ['required', 'in:sales,purchase,both'],
            'is_compound' => ['boolean'],
            'is_active'   => ['boolean'],
        ]);

        TaxRate::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->route('finance.tax-rates.index')
            ->with('success', 'Tax rate created successfully.');
    }

    public function show(TaxRate $taxRate): Response
    {
        return Inertia::render('Finance/TaxRates/Show', [
            'taxRate' => $taxRate->load('taxGroupItems'),
        ]);
    }

    public function destroy(TaxRate $taxRate): RedirectResponse
    {
        $this->authorize('delete', $taxRate);

        $taxRate->delete();

        return redirect()->route('finance.tax-rates.index')
            ->with('success', 'Tax rate deleted successfully.');
    }
}

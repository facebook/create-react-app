<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\CashFlowForecast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashFlowForecastController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CashFlowForecast::class);

        $forecasts = CashFlowForecast::orderByDesc('id')->paginate(20);

        return Inertia::render('Finance/CashFlowForecasts/Index', [
            'forecasts' => $forecasts,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', CashFlowForecast::class);

        return Inertia::render('Finance/CashFlowForecasts/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CashFlowForecast::class);

        $validated = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'period_start'    => ['required', 'date'],
            'period_end'      => ['required', 'date', 'after_or_equal:period_start'],
            'opening_balance' => ['nullable', 'numeric'],
        ]);

        CashFlowForecast::create([
            'tenant_id'       => app('tenant')->id,
            'created_by'      => auth()->id(),
            'name'            => $validated['name'],
            'period_start'    => $validated['period_start'],
            'period_end'      => $validated['period_end'],
            'opening_balance' => $validated['opening_balance'] ?? 0,
        ]);

        return redirect()->route('finance.cash-flow-forecasts.index');
    }

    public function show(CashFlowForecast $cashFlowForecast): Response
    {
        $this->authorize('view', $cashFlowForecast);

        return Inertia::render('Finance/CashFlowForecasts/Show', [
            'forecast' => $cashFlowForecast,
        ]);
    }

    public function edit(CashFlowForecast $cashFlowForecast): Response
    {
        $this->authorize('update', $cashFlowForecast);

        return Inertia::render('Finance/CashFlowForecasts/Edit', [
            'forecast' => $cashFlowForecast,
        ]);
    }

    public function update(Request $request, CashFlowForecast $cashFlowForecast): RedirectResponse
    {
        $this->authorize('update', $cashFlowForecast);

        $validated = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'period_start'       => ['required', 'date'],
            'period_end'         => ['required', 'date', 'after_or_equal:period_start'],
            'opening_balance'    => ['nullable', 'numeric'],
            'projected_inflows'  => ['nullable', 'numeric'],
            'projected_outflows' => ['nullable', 'numeric'],
            'actual_inflows'     => ['nullable', 'numeric'],
            'actual_outflows'    => ['nullable', 'numeric'],
            'notes'              => ['nullable', 'string'],
        ]);

        $cashFlowForecast->update($validated);

        return redirect()->route('finance.cash-flow-forecasts.index');
    }

    public function destroy(CashFlowForecast $cashFlowForecast): RedirectResponse
    {
        $this->authorize('delete', $cashFlowForecast);

        $cashFlowForecast->delete();

        return redirect()->route('finance.cash-flow-forecasts.index');
    }

    public function publish(Request $request, CashFlowForecast $cashFlowForecast): RedirectResponse
    {
        $this->authorize('publish', $cashFlowForecast);

        $cashFlowForecast->publish(auth()->id());

        return redirect()->route('finance.cash-flow-forecasts.index');
    }

    public function archive(Request $request, CashFlowForecast $cashFlowForecast): RedirectResponse
    {
        $this->authorize('archive', $cashFlowForecast);

        $cashFlowForecast->archive();

        return redirect()->route('finance.cash-flow-forecasts.index');
    }
}

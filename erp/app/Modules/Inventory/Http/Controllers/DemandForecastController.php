<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\DemandForecast;
use App\Modules\Inventory\Models\ForecastAlert;
use App\Modules\Inventory\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DemandForecastController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DemandForecast::class);

        $query = DemandForecast::with('product')
            ->where('tenant_id', auth()->user()->tenant_id);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $forecasts = $query->orderByDesc('forecast_date')->paginate(20);
        $filters = $request->only('product_id');

        return Inertia::render('Inventory/DemandForecasts/Index', compact('forecasts', 'filters'));
    }

    public function create(): Response
    {
        $this->authorize('create', DemandForecast::class);

        $products = Product::where('tenant_id', auth()->user()->tenant_id)
            ->orderBy('name')
            ->get(['id', 'name', 'sku']);

        return Inertia::render('Inventory/DemandForecasts/Create', compact('products'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', DemandForecast::class);

        $data = $request->validate([
            'product_id'          => ['required', 'exists:products,id'],
            'forecast_date'       => ['required', 'date'],
            'forecasted_quantity' => ['required', 'numeric', 'min:0'],
            'method'              => ['required', 'in:moving_avg,weighted_avg,manual'],
            'confidence_score'    => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes'               => ['nullable', 'string'],
            'warehouse_id'        => ['nullable', 'exists:warehouses,id'],
        ]);

        DemandForecast::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$data,
        ]);

        return redirect()->route('inventory.demand-forecasts.index')
            ->with('success', 'Demand forecast created.');
    }

    public function show(DemandForecast $demandForecast): Response
    {
        $this->authorize('view', $demandForecast);
        $demandForecast->load('product');

        return Inertia::render('Inventory/DemandForecasts/Show', [
            'forecast' => $demandForecast->append('accuracy'),
        ]);
    }

    public function update(Request $request, DemandForecast $demandForecast): RedirectResponse
    {
        $this->authorize('create', DemandForecast::class);

        $data = $request->validate([
            'actual_quantity' => ['required', 'numeric', 'min:0'],
            'notes'           => ['nullable', 'string'],
        ]);

        $demandForecast->update($data);

        return back()->with('success', 'Forecast updated.');
    }

    public function destroy(DemandForecast $demandForecast): RedirectResponse
    {
        $this->authorize('delete', $demandForecast);
        $demandForecast->delete();

        return redirect()->route('inventory.demand-forecasts.index')
            ->with('success', 'Forecast deleted.');
    }

    public function generateForecast(Request $request): RedirectResponse
    {
        $this->authorize('create', DemandForecast::class);

        $data = $request->validate([
            'product_id'    => ['required', 'exists:products,id'],
            'periods'       => ['nullable', 'integer', 'min:1', 'max:12'],
            'forecast_date' => ['required', 'date'],
        ]);

        $tenantId  = auth()->user()->tenant_id;
        $productId = (int) $data['product_id'];
        $periods   = isset($data['periods']) ? (int) $data['periods'] : 3;

        $quantity = DemandForecast::generateMovingAvg($tenantId, $productId, $periods);

        DemandForecast::create([
            'tenant_id'          => $tenantId,
            'product_id'         => $productId,
            'forecast_date'      => $data['forecast_date'],
            'forecasted_quantity' => $quantity,
            'method'             => 'moving_avg',
        ]);

        return back()->with('success', 'Forecast generated using moving average.');
    }

    public function alerts(Request $request): Response
    {
        $this->authorize('viewAny', DemandForecast::class);

        $alerts = ForecastAlert::unresolved()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->with('product')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Inventory/DemandForecasts/Alerts', compact('alerts'));
    }

    public function resolveAlert(Request $request, ForecastAlert $alert): RedirectResponse
    {
        $this->authorize('create', DemandForecast::class);
        $alert->resolve();

        return back()->with('success', 'Alert resolved.');
    }
}

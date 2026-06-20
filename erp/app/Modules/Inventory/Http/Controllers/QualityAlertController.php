<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\QualityAlert;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QualityAlertController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', QualityAlert::class);

        $alerts = QualityAlert::with(['product'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/QualityAlerts/Index', [
            'alerts' => $alerts,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', QualityAlert::class);

        return Inertia::render('Inventory/QualityAlerts/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', QualityAlert::class);

        $validated = $request->validate([
            'title'      => 'required|string',
            'alert_type' => 'nullable|in:defect,contamination,non-conformance,recall,expiry',
            'severity'   => 'nullable|in:low,medium,high,critical',
            'product_id' => 'nullable|exists:products,id',
        ]);

        QualityAlert::create([
            'tenant_id'   => app('tenant')->id,
            'created_by'  => auth()->id(),
            'reported_by' => auth()->id(),
            ...$validated,
        ]);

        return redirect()->route('inventory.quality-alerts.index')
            ->with('success', 'Quality alert created.');
    }

    public function show(QualityAlert $qualityAlert): Response
    {
        $this->authorize('view', $qualityAlert);

        $qualityAlert->load(['product']);

        return Inertia::render('Inventory/QualityAlerts/Show', [
            'alert' => $qualityAlert,
        ]);
    }

    public function edit(QualityAlert $qualityAlert): Response
    {
        $this->authorize('update', $qualityAlert);

        $qualityAlert->load(['product']);

        return Inertia::render('Inventory/QualityAlerts/Edit', [
            'alert' => $qualityAlert,
        ]);
    }

    public function update(Request $request, QualityAlert $qualityAlert): RedirectResponse
    {
        $this->authorize('update', $qualityAlert);

        $validated = $request->validate([
            'title'      => 'required|string',
            'alert_type' => 'nullable|in:defect,contamination,non-conformance,recall,expiry',
            'severity'   => 'nullable|in:low,medium,high,critical',
            'product_id' => 'nullable|exists:products,id',
        ]);

        $qualityAlert->update($validated);

        return redirect()->route('inventory.quality-alerts.index')
            ->with('success', 'Quality alert updated.');
    }

    public function destroy(QualityAlert $qualityAlert): RedirectResponse
    {
        $this->authorize('delete', $qualityAlert);

        $qualityAlert->delete();

        return redirect()->route('inventory.quality-alerts.index')
            ->with('success', 'Quality alert deleted.');
    }

    public function investigate(QualityAlert $qualityAlert): RedirectResponse
    {
        $this->authorize('investigate', $qualityAlert);

        $qualityAlert->investigate();

        return redirect()->route('inventory.quality-alerts.index')
            ->with('success', 'Quality alert is now under investigation.');
    }

    public function resolve(Request $request, QualityAlert $qualityAlert): RedirectResponse
    {
        $this->authorize('resolve', $qualityAlert);

        $data = $request->validate([
            'root_cause'        => 'required|string',
            'corrective_action' => 'required|string',
        ]);

        $qualityAlert->resolve($data['root_cause'], $data['corrective_action']);

        return redirect()->route('inventory.quality-alerts.index')
            ->with('success', 'Quality alert resolved.');
    }

    public function close(QualityAlert $qualityAlert): RedirectResponse
    {
        $this->authorize('close', $qualityAlert);

        $qualityAlert->close();

        return redirect()->route('inventory.quality-alerts.index')
            ->with('success', 'Quality alert closed.');
    }
}

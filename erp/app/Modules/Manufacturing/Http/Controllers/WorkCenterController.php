<?php

namespace App\Modules\Manufacturing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Manufacturing\Models\WorkCenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkCenterController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', WorkCenter::class);

        $workCenters = WorkCenter::when(
            $request->search,
            fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('code', 'like', "%{$request->search}%")
        )
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Manufacturing/WorkCenters/Index', [
            'workCenters' => $workCenters,
            'filters'     => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', WorkCenter::class);

        return Inertia::render('Manufacturing/WorkCenters/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', WorkCenter::class);

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'code'              => 'nullable|string|max:100',
            'capacity'          => 'nullable|numeric|min:0',
            'efficiency_factor' => 'nullable|numeric|min:0|max:999',
            'time_efficiency'   => 'nullable|numeric|min:0|max:999',
            'hourly_cost'       => 'nullable|numeric|min:0',
            'is_active'         => 'boolean',
            'description'       => 'nullable|string',
        ]);

        WorkCenter::create([...$validated, 'tenant_id' => auth()->user()->tenant_id]);

        return redirect()->route('manufacturing.work-centers.index')
            ->with('success', 'Work Center created successfully.');
    }

    public function show(WorkCenter $workCenter): Response
    {
        $this->authorize('view', $workCenter);

        return Inertia::render('Manufacturing/WorkCenters/Show', [
            'workCenter' => $workCenter,
        ]);
    }

    public function edit(WorkCenter $workCenter): Response
    {
        $this->authorize('update', $workCenter);

        return Inertia::render('Manufacturing/WorkCenters/Edit', [
            'workCenter' => $workCenter,
        ]);
    }

    public function update(Request $request, WorkCenter $workCenter): RedirectResponse
    {
        $this->authorize('update', $workCenter);

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'code'              => 'nullable|string|max:100',
            'capacity'          => 'nullable|numeric|min:0',
            'efficiency_factor' => 'nullable|numeric|min:0|max:999',
            'time_efficiency'   => 'nullable|numeric|min:0|max:999',
            'hourly_cost'       => 'nullable|numeric|min:0',
            'is_active'         => 'boolean',
            'description'       => 'nullable|string',
        ]);

        $workCenter->update($validated);

        return redirect()->route('manufacturing.work-centers.index')
            ->with('success', 'Work Center updated successfully.');
    }

    public function destroy(WorkCenter $workCenter): RedirectResponse
    {
        $this->authorize('delete', $workCenter);

        $workCenter->delete();

        return redirect()->route('manufacturing.work-centers.index')
            ->with('success', 'Work Center deleted successfully.');
    }
}

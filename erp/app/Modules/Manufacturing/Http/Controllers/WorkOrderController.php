<?php

namespace App\Modules\Manufacturing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\Manufacturing\Models\WorkCenter;
use App\Modules\Manufacturing\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller
{
    public function index(ManufacturingOrder $manufacturingOrder): Response
    {
        $this->authorize('viewAny', WorkOrder::class);

        $manufacturingOrder->load(['workOrders.workCenter', 'product']);

        return Inertia::render('Manufacturing/WorkOrders/Index', [
            'order'      => $manufacturingOrder,
            'workOrders' => $manufacturingOrder->workOrders,
        ]);
    }

    public function create(ManufacturingOrder $manufacturingOrder): Response
    {
        $this->authorize('create', WorkOrder::class);

        return Inertia::render('Manufacturing/WorkOrders/Create', [
            'order'       => $manufacturingOrder,
            'workCenters' => WorkCenter::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request, ManufacturingOrder $manufacturingOrder): RedirectResponse
    {
        $this->authorize('create', WorkOrder::class);

        $validated = $request->validate([
            'work_center_id'    => 'nullable|exists:work_centers,id',
            'operation_name'    => 'required|string|max:255',
            'sequence'          => 'nullable|integer|min:1',
            'duration_expected' => 'nullable|numeric|min:0',
            'scheduled_start'   => 'nullable|date',
            'notes'             => 'nullable|string',
        ]);

        $manufacturingOrder->workOrders()->create($validated);

        return redirect()->route('manufacturing.manufacturing-orders.work-orders.index', $manufacturingOrder)
            ->with('success', 'Work Order created successfully.');
    }

    public function edit(ManufacturingOrder $manufacturingOrder, WorkOrder $workOrder): Response
    {
        $this->authorize('update', $workOrder);

        return Inertia::render('Manufacturing/WorkOrders/Edit', [
            'order'       => $manufacturingOrder,
            'workOrder'   => $workOrder->load('workCenter'),
            'workCenters' => WorkCenter::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function update(Request $request, ManufacturingOrder $manufacturingOrder, WorkOrder $workOrder): RedirectResponse
    {
        $this->authorize('update', $workOrder);

        $validated = $request->validate([
            'work_center_id'    => 'nullable|exists:work_centers,id',
            'operation_name'    => 'required|string|max:255',
            'sequence'          => 'nullable|integer|min:1',
            'duration_expected' => 'nullable|numeric|min:0',
            'scheduled_start'   => 'nullable|date',
            'notes'             => 'nullable|string',
        ]);

        $workOrder->update($validated);

        return redirect()->route('manufacturing.manufacturing-orders.work-orders.index', $manufacturingOrder)
            ->with('success', 'Work Order updated successfully.');
    }

    public function destroy(ManufacturingOrder $manufacturingOrder, WorkOrder $workOrder): RedirectResponse
    {
        $this->authorize('delete', $workOrder);

        $workOrder->delete();

        return redirect()->route('manufacturing.manufacturing-orders.work-orders.index', $manufacturingOrder)
            ->with('success', 'Work Order deleted successfully.');
    }

    public function start(ManufacturingOrder $manufacturingOrder, WorkOrder $workOrder): RedirectResponse
    {
        $this->authorize('update', $workOrder);

        $workOrder->start();

        return redirect()->route('manufacturing.manufacturing-orders.work-orders.index', $manufacturingOrder)
            ->with('success', 'Work Order started.');
    }

    public function finish(ManufacturingOrder $manufacturingOrder, WorkOrder $workOrder): RedirectResponse
    {
        $this->authorize('update', $workOrder);

        $workOrder->finish();

        return redirect()->route('manufacturing.manufacturing-orders.work-orders.index', $manufacturingOrder)
            ->with('success', 'Work Order finished.');
    }

    public function cancel(ManufacturingOrder $manufacturingOrder, WorkOrder $workOrder): RedirectResponse
    {
        $this->authorize('update', $workOrder);

        $workOrder->cancel();

        return redirect()->route('manufacturing.manufacturing-orders.work-orders.index', $manufacturingOrder)
            ->with('success', 'Work Order cancelled.');
    }
}

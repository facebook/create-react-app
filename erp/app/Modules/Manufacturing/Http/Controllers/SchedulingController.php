<?php

namespace App\Modules\Manufacturing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Manufacturing\Models\ProductionSchedule;
use App\Modules\Manufacturing\Models\WorkCenter;
use App\Modules\Manufacturing\Models\WorkCenterCapacity;
use App\Modules\Manufacturing\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchedulingController extends Controller
{
    public function gantt(Request $request): Response
    {
        $startOfWeek = $request->start
            ? \Carbon\Carbon::parse($request->start)->startOfDay()
            : now()->startOfWeek(\Carbon\Carbon::MONDAY);

        $endOfWeek = $startOfWeek->copy()->endOfWeek(\Carbon\Carbon::SUNDAY)->endOfDay();

        $schedules = ProductionSchedule::with(['workOrder.manufacturingOrder', 'workCenter'])
            ->whereBetween('scheduled_start', [$startOfWeek, $endOfWeek])
            ->orWhereBetween('scheduled_end', [$startOfWeek, $endOfWeek])
            ->get()
            ->groupBy('work_center_id');

        $workCenters = WorkCenter::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Manufacturing/Scheduling/Gantt', [
            'schedules'   => $schedules,
            'workCenters' => $workCenters,
            'workOrders'  => WorkOrder::with('manufacturingOrder')->get(['id', 'operation_name', 'manufacturing_order_id']),
            'weekStart'   => $startOfWeek->toDateString(),
            'weekEnd'     => $endOfWeek->toDateString(),
        ]);
    }

    public function schedule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'work_order_id'   => 'required|exists:work_orders,id',
            'work_center_id'  => 'required|exists:work_centers,id',
            'scheduled_start' => 'required|date',
            'scheduled_end'   => 'required|date|after:scheduled_start',
            'notes'           => 'nullable|string',
        ]);

        $schedule = new ProductionSchedule($validated);

        if ($schedule->overlapsWithWorkCenter()) {
            abort(422, 'Work center not available at this time.');
        }

        $schedule->save();

        return redirect()->route('manufacturing.scheduling.gantt')
            ->with('success', 'Production schedule created.');
    }

    public function confirm(ProductionSchedule $schedule): RedirectResponse
    {
        $schedule->confirm();

        return back()->with('success', 'Schedule confirmed.');
    }

    public function start(ProductionSchedule $schedule): RedirectResponse
    {
        $schedule->start();

        return back()->with('success', 'Schedule started.');
    }

    public function complete(ProductionSchedule $schedule): RedirectResponse
    {
        $schedule->complete();

        // Update linked WorkOrder actual times
        $workOrder = $schedule->workOrder;
        if ($workOrder) {
            if (! $workOrder->actual_start) {
                $workOrder->actual_start = $schedule->scheduled_start;
            }
            $workOrder->actual_finish = now();
            $workOrder->save();
        }

        return back()->with('success', 'Schedule completed.');
    }

    public function destroy(ProductionSchedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return redirect()->route('manufacturing.scheduling.gantt')
            ->with('success', 'Schedule deleted.');
    }

    public function capacity(Request $request): Response
    {
        $capacities  = WorkCenterCapacity::with('workCenter')->orderBy('work_center_id')->orderBy('day_of_week')->get();
        $workCenters = WorkCenter::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Manufacturing/Scheduling/Capacity', [
            'capacities'  => $capacities,
            'workCenters' => $workCenters,
        ]);
    }

    public function storeCapacity(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'work_center_id' => 'required|exists:work_centers,id',
            'day_of_week'    => 'required|integer|min:0|max:6',
            'start_time'     => 'required|date_format:H:i',
            'end_time'       => 'required|date_format:H:i|after:start_time',
            'capacity_hours' => 'nullable|numeric|min:0',
        ]);

        if (! isset($validated['capacity_hours'])) {
            [$sh, $sm] = array_map('intval', explode(':', $validated['start_time']));
            [$eh, $em] = array_map('intval', explode(':', $validated['end_time']));
            $validated['capacity_hours'] = (($eh * 60 + $em) - ($sh * 60 + $sm)) / 60;
        }

        WorkCenterCapacity::create($validated);

        return redirect()->route('manufacturing.scheduling.capacity')
            ->with('success', 'Capacity added.');
    }

    public function destroyCapacity(WorkCenterCapacity $capacity): RedirectResponse
    {
        $capacity->delete();

        return redirect()->route('manufacturing.scheduling.capacity')
            ->with('success', 'Capacity removed.');
    }
}

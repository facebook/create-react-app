<?php

namespace App\Modules\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Maintenance\Models\Equipment;
use App\Modules\Maintenance\Models\MaintenancePlan;
use App\Modules\Maintenance\Models\MaintenanceOrder;
use App\Models\User;
use Illuminate\Http\{JsonResponse, RedirectResponse, Request};
use Inertia\{Inertia, Response};

class MaintenanceController extends Controller
{
    public function dashboard(): Response
    {
        $tenantId = app('tenant')->id;
        return Inertia::render('Maintenance/Dashboard', [
            'stats' => [
                'total_equipment' => Equipment::withoutGlobalScopes()->where('tenant_id', $tenantId)->count(),
                'operational'     => Equipment::withoutGlobalScopes()->where('tenant_id', $tenantId)->where('status', 'operational')->count(),
                'open_orders'     => MaintenanceOrder::withoutGlobalScopes()->where('tenant_id', $tenantId)->whereIn('status', ['open', 'in_progress'])->count(),
                'overdue_plans'   => MaintenancePlan::withoutGlobalScopes()->where('tenant_id', $tenantId)->where('is_active', true)->where('next_due_at', '<', now())->count(),
            ],
        ]);
    }

    public function equipment(): Response
    {
        $equipment = Equipment::withoutGlobalScopes()
            ->where('tenant_id', app('tenant')->id)
            ->with('assignedUser')
            ->orderBy('name')
            ->paginate(20);
        return Inertia::render('Maintenance/Equipment/Index', ['equipment' => $equipment]);
    }

    public function storeEquipment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'code'            => 'nullable|string|max:100',
            'category'        => 'required|in:machinery,electrical,hvac,vehicle,it,other',
            'location'        => 'nullable|string|max:255',
            'serial_number'   => 'nullable|string|max:255',
            'manufacturer'    => 'nullable|string|max:255',
            'model'           => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'status'          => 'sometimes|in:operational,under_maintenance,out_of_service,retired',
            'assigned_to'     => 'nullable|exists:users,id',
        ]);
        Equipment::create(['tenant_id' => app('tenant')->id] + $validated);
        return redirect()->route('maintenance.equipment')->with('success', 'Equipment added.');
    }

    public function orders(): Response
    {
        $orders = MaintenanceOrder::withoutGlobalScopes()
            ->where('tenant_id', app('tenant')->id)
            ->with(['equipment', 'assignedUser'])
            ->orderByDesc('created_at')
            ->paginate(20);
        return Inertia::render('Maintenance/Orders/Index', ['orders' => $orders]);
    }

    public function storeOrder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'equipment_id'    => 'required|exists:equipment,id',
            'type'            => 'required|in:preventive,corrective,emergency',
            'priority'        => 'required|in:low,medium,high,critical',
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'scheduled_date'  => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'assigned_to'     => 'nullable|exists:users,id',
        ]);
        $validated['order_number'] = MaintenanceOrder::generateOrderNumber(app('tenant')->id);
        MaintenanceOrder::create(['tenant_id' => app('tenant')->id, 'reported_by' => auth()->id()] + $validated);
        return redirect()->route('maintenance.orders')->with('success', 'Order created.');
    }

    public function startOrder(MaintenanceOrder $order): RedirectResponse
    {
        $order->start();
        return redirect()->back()->with('success', 'Order started.');
    }

    public function completeOrder(Request $request, MaintenanceOrder $order): RedirectResponse
    {
        $validated = $request->validate([
            'resolution'   => 'required|string',
            'actual_hours' => 'required|numeric|min:0',
            'cost'         => 'nullable|numeric|min:0',
        ]);
        $order->complete($validated['resolution'], (float) $validated['actual_hours']);
        if (isset($validated['cost'])) {
            $order->update(['cost' => $validated['cost']]);
        }
        if ($order->plan_id) {
            $order->plan?->markPerformed();
        }
        return redirect()->back()->with('success', 'Order completed.');
    }

    public function plans(): Response
    {
        $plans = MaintenancePlan::withoutGlobalScopes()
            ->where('tenant_id', app('tenant')->id)
            ->with('equipment')
            ->orderBy('next_due_at')
            ->get();
        return Inertia::render('Maintenance/Plans/Index', ['plans' => $plans]);
    }

    public function storePlan(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'equipment_id'             => 'required|exists:equipment,id',
            'name'                     => 'required|string|max:255',
            'frequency'                => 'required|in:daily,weekly,monthly,quarterly,annual,as_needed',
            'estimated_duration_hours' => 'nullable|numeric|min:0',
            'description'              => 'nullable|string',
        ]);
        $plan = MaintenancePlan::create(['tenant_id' => app('tenant')->id] + $validated);
        $plan->next_due_at = $plan->calculateNextDue();
        $plan->save();
        return redirect()->route('maintenance.plans')->with('success', 'Maintenance plan created.');
    }
}

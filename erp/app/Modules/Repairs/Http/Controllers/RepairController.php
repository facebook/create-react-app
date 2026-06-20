<?php

namespace App\Modules\Repairs\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Repairs\Models\RepairLine;
use App\Modules\Repairs\Models\RepairOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RepairController extends Controller
{
    public function dashboard(): Response
    {
        $tenantId = app('tenant')->id;
        $today = now()->toDateString();

        return Inertia::render('Repairs/Dashboard', [
            'stats' => [
                'total'           => RepairOrder::withoutGlobalScopes()->where('tenant_id', $tenantId)->count(),
                'open'            => RepairOrder::withoutGlobalScopes()->where('tenant_id', $tenantId)->whereIn('status', ['draft', 'confirmed', 'in_progress'])->count(),
                'in_progress'     => RepairOrder::withoutGlobalScopes()->where('tenant_id', $tenantId)->where('status', 'in_progress')->count(),
                'completed_today' => RepairOrder::withoutGlobalScopes()->where('tenant_id', $tenantId)->where('status', 'done')->whereDate('completed_at', $today)->count(),
                'overdue'         => RepairOrder::withoutGlobalScopes()->where('tenant_id', $tenantId)->whereNotIn('status', ['done', 'cancelled'])->whereNotNull('scheduled_date')->where('scheduled_date', '<', $today)->count(),
            ],
        ]);
    }

    public function index(): Response
    {
        $repairs = RepairOrder::withoutGlobalScopes()
            ->where('tenant_id', app('tenant')->id)
            ->with('assignedUser')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Repairs/Orders/Index', ['repairs' => $repairs]);
    }

    public function show(RepairOrder $order): Response
    {
        $order->load(['lines.product', 'assignedUser', 'contact']);

        return Inertia::render('Repairs/Orders/Show', ['order' => $order]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_name'    => 'required|string|max:255',
            'serial_number'   => 'nullable|string|max:255',
            'priority'        => 'nullable|in:low,medium,high,urgent',
            'diagnosis'       => 'nullable|string',
            'scheduled_date'  => 'nullable|date',
            'assigned_to'     => 'nullable|exists:users,id',
            'warranty_claim'  => 'nullable|boolean',
            'estimated_hours' => 'nullable|numeric|min:0',
            'estimated_cost'  => 'nullable|numeric|min:0',
        ]);

        $tenantId = app('tenant')->id;
        RepairOrder::create(array_merge(
            ['tenant_id' => $tenantId, 'order_number' => RepairOrder::generateOrderNumber($tenantId)],
            $validated
        ));

        return redirect()->route('repairs.orders.index')->with('success', 'Repair order created.');
    }

    public function update(Request $request, RepairOrder $order): RedirectResponse
    {
        $validated = $request->validate([
            'product_name'    => 'required|string|max:255',
            'serial_number'   => 'nullable|string|max:255',
            'priority'        => 'nullable|in:low,medium,high,urgent',
            'status'          => 'nullable|in:draft,confirmed,in_progress,done,cancelled',
            'diagnosis'       => 'nullable|string',
            'scheduled_date'  => 'nullable|date',
            'assigned_to'     => 'nullable|exists:users,id',
            'warranty_claim'  => 'nullable|boolean',
            'estimated_hours' => 'nullable|numeric|min:0',
            'estimated_cost'  => 'nullable|numeric|min:0',
        ]);

        $order->update($validated);

        return redirect()->back()->with('success', 'Repair order updated.');
    }

    public function addLine(Request $request, RepairOrder $order): RedirectResponse
    {
        $validated = $request->validate([
            'line_type'   => 'required|in:part,labor,service',
            'description' => 'required|string|max:255',
            'quantity'    => 'required|numeric|min:0.01',
            'unit_price'  => 'required|numeric|min:0',
            'product_id'  => 'nullable|exists:products,id',
        ]);

        $validated['total'] = $validated['quantity'] * $validated['unit_price'];

        $order->lines()->create(array_merge(
            ['tenant_id' => app('tenant')->id],
            $validated
        ));

        return redirect()->back()->with('success', 'Line added.');
    }

    public function removeLine(RepairLine $line): RedirectResponse
    {
        $line->delete();

        return redirect()->back()->with('success', 'Line removed.');
    }

    public function confirm(RepairOrder $order): RedirectResponse
    {
        $order->confirm();

        return redirect()->back()->with('success', 'Order confirmed.');
    }

    public function start(RepairOrder $order): RedirectResponse
    {
        $order->start();

        return redirect()->back()->with('success', 'Order started.');
    }

    public function complete(Request $request, RepairOrder $order): RedirectResponse
    {
        $validated = $request->validate([
            'actual_hours' => 'nullable|numeric|min:0',
        ]);

        if (!empty($validated['actual_hours'])) {
            $order->update(['actual_hours' => $validated['actual_hours']]);
        }

        $order->complete();

        return redirect()->back()->with('success', 'Order completed.');
    }

    public function cancel(RepairOrder $order): RedirectResponse
    {
        $order->cancel();

        return redirect()->back()->with('success', 'Order cancelled.');
    }
}

<?php

namespace App\Modules\FieldService\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\FieldService\Models\ServiceChecklist;
use App\Modules\FieldService\Models\ServiceOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ServiceOrder::with('technician')
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $orders = $query->paginate(25)->withQueryString();

        return Inertia::render('FieldService/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'priority', 'assigned_to']),
            'users'   => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('FieldService/Orders/Create', [
            'users'      => User::orderBy('name')->get(['id', 'name']),
            'checklists' => ServiceChecklist::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string',
            'type'               => 'required|in:installation,repair,maintenance,inspection,other',
            'priority'           => 'required|in:low,medium,high,urgent',
            'status'             => 'nullable|in:pending,assigned,in_progress,on_hold,completed,cancelled',
            'customer_name'      => 'nullable|string|max:255',
            'customer_email'     => 'nullable|email|max:255',
            'customer_phone'     => 'nullable|string|max:50',
            'address'            => 'nullable|string',
            'scheduled_at'       => 'nullable|date',
            'estimated_duration' => 'nullable|integer|min:0',
            'assigned_to'        => 'nullable|exists:users,id',
            'notes'              => 'nullable|string',
            'items'              => 'nullable|array',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.quantity'    => 'required_with:items|numeric|min:0',
            'items.*.unit_price'  => 'required_with:items|numeric|min:0',
            'items.*.line_total'  => 'nullable|numeric|min:0',
        ]);

        $order = ServiceOrder::create([
            'tenant_id'          => auth()->user()->tenant_id,
            'title'              => $validated['title'],
            'description'        => $validated['description'] ?? null,
            'type'               => $validated['type'],
            'priority'           => $validated['priority'],
            'status'             => $validated['status'] ?? 'pending',
            'customer_name'      => $validated['customer_name'] ?? null,
            'customer_email'     => $validated['customer_email'] ?? null,
            'customer_phone'     => $validated['customer_phone'] ?? null,
            'address'            => $validated['address'] ?? null,
            'scheduled_at'       => $validated['scheduled_at'] ?? null,
            'estimated_duration' => $validated['estimated_duration'] ?? null,
            'assigned_to'        => $validated['assigned_to'] ?? null,
            'notes'              => $validated['notes'] ?? null,
            'created_by'         => auth()->id(),
        ]);

        $order->order_number = $order->generateOrderNumber();
        $order->save();

        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $order->items()->create([
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'line_total'  => $item['line_total'] ?? ($item['quantity'] * $item['unit_price']),
                ]);
            }
        }

        return redirect()->route('field-service.orders.show', $order)->with('success', 'Service order created.');
    }

    public function show(ServiceOrder $order): Response
    {
        $order->load(['technician', 'items', 'checklistResults.checklistItem']);

        return Inertia::render('FieldService/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function edit(ServiceOrder $order): Response
    {
        $order->load(['items']);

        return Inertia::render('FieldService/Orders/Edit', [
            'order'      => $order,
            'users'      => User::orderBy('name')->get(['id', 'name']),
            'checklists' => ServiceChecklist::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, ServiceOrder $order): RedirectResponse
    {
        $validated = $request->validate([
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string',
            'type'               => 'required|in:installation,repair,maintenance,inspection,other',
            'priority'           => 'required|in:low,medium,high,urgent',
            'status'             => 'nullable|in:pending,assigned,in_progress,on_hold,completed,cancelled',
            'customer_name'      => 'nullable|string|max:255',
            'customer_email'     => 'nullable|email|max:255',
            'customer_phone'     => 'nullable|string|max:50',
            'address'            => 'nullable|string',
            'scheduled_at'       => 'nullable|date',
            'estimated_duration' => 'nullable|integer|min:0',
            'assigned_to'        => 'nullable|exists:users,id',
            'notes'              => 'nullable|string',
            'items'              => 'nullable|array',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.quantity'    => 'required_with:items|numeric|min:0',
            'items.*.unit_price'  => 'required_with:items|numeric|min:0',
            'items.*.line_total'  => 'nullable|numeric|min:0',
        ]);

        $order->update([
            'title'              => $validated['title'],
            'description'        => $validated['description'] ?? null,
            'type'               => $validated['type'],
            'priority'           => $validated['priority'],
            'status'             => $validated['status'] ?? $order->status,
            'customer_name'      => $validated['customer_name'] ?? null,
            'customer_email'     => $validated['customer_email'] ?? null,
            'customer_phone'     => $validated['customer_phone'] ?? null,
            'address'            => $validated['address'] ?? null,
            'scheduled_at'       => $validated['scheduled_at'] ?? null,
            'estimated_duration' => $validated['estimated_duration'] ?? null,
            'assigned_to'        => $validated['assigned_to'] ?? null,
            'notes'              => $validated['notes'] ?? null,
        ]);

        // Sync items
        $order->items()->delete();
        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $order->items()->create([
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'line_total'  => $item['line_total'] ?? ($item['quantity'] * $item['unit_price']),
                ]);
            }
        }

        return redirect()->route('field-service.orders.show', $order)->with('success', 'Service order updated.');
    }

    public function destroy(ServiceOrder $order): RedirectResponse
    {
        $order->delete();

        return redirect()->route('field-service.orders.index')->with('success', 'Service order deleted.');
    }

    public function start(ServiceOrder $order): RedirectResponse
    {
        $order->start();

        return redirect()->back()->with('success', 'Service order started.');
    }

    public function complete(ServiceOrder $order): RedirectResponse
    {
        $order->complete();

        return redirect()->back()->with('success', 'Service order completed.');
    }

    public function cancel(ServiceOrder $order): RedirectResponse
    {
        $order->cancel();

        return redirect()->back()->with('success', 'Service order cancelled.');
    }

    public function updateChecklist(Request $request, ServiceOrder $order): RedirectResponse
    {
        $validated = $request->validate([
            'results'                     => 'required|array',
            'results.*.checklist_item_id' => 'required|exists:service_checklist_items,id',
            'results.*.is_checked'        => 'required|boolean',
            'results.*.notes'             => 'nullable|string|max:255',
        ]);

        foreach ($validated['results'] as $result) {
            $order->checklistResults()->updateOrCreate(
                ['checklist_item_id' => $result['checklist_item_id']],
                [
                    'is_checked' => $result['is_checked'],
                    'notes'      => $result['notes'] ?? null,
                ]
            );
        }

        return redirect()->back()->with('success', 'Checklist updated.');
    }
}

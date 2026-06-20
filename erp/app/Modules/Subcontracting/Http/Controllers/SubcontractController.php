<?php

namespace App\Modules\Subcontracting\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Subcontracting\Models\SubcontractComponent;
use App\Modules\Subcontracting\Models\SubcontractOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubcontractController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = SubcontractOrder::with(['components'])
            ->when($request->status, fn ($q) => $q->byStatus($request->status))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Subcontracting/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status']),
        ]);
    }

    public function show(SubcontractOrder $order): Response
    {
        $order->load('components');

        return Inertia::render('Subcontracting/Show', [
            'order' => $order,
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'reference'        => 'required|string|max:255|unique:subcontracts,reference',
            'vendor_id'        => 'nullable|exists:users,id',
            'finished_product' => 'required|string|max:255',
            'finished_qty'     => 'required|numeric|min:0.0001',
            'unit_price'       => 'required|numeric|min:0',
            'notes'            => 'nullable|string',
            'components'       => 'nullable|array',
            'components.*.component_name' => 'required_with:components|string|max:255',
            'components.*.quantity'       => 'required_with:components|numeric|min:0.0001',
            'components.*.unit'           => 'nullable|string|max:50',
        ]);

        $order = SubcontractOrder::create([
            'tenant_id'        => auth()->user()->tenant_id,
            'vendor_id'        => $validated['vendor_id'] ?? null,
            'reference'        => $validated['reference'],
            'finished_product' => $validated['finished_product'],
            'finished_qty'     => $validated['finished_qty'],
            'unit_price'       => $validated['unit_price'],
            'notes'            => $validated['notes'] ?? null,
            'status'           => 'draft',
        ]);

        foreach ($validated['components'] ?? [] as $comp) {
            $order->components()->create([
                'tenant_id'      => $order->tenant_id,
                'component_name' => $comp['component_name'],
                'quantity'       => $comp['quantity'],
                'unit'           => $comp['unit'] ?? 'pcs',
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json($order->load('components'), 201);
        }

        return redirect()->route('subcontracting.orders.show', $order)
            ->with('success', 'Subcontract order created successfully.');
    }

    public function update(Request $request, SubcontractOrder $order): RedirectResponse
    {
        abort_if($order->status !== 'draft', 403, 'Only draft orders can be updated.');

        $validated = $request->validate([
            'reference'        => 'required|string|max:255|unique:subcontracts,reference,' . $order->id,
            'vendor_id'        => 'nullable|exists:users,id',
            'finished_product' => 'required|string|max:255',
            'finished_qty'     => 'required|numeric|min:0.0001',
            'unit_price'       => 'required|numeric|min:0',
            'notes'            => 'nullable|string',
        ]);

        $order->update($validated);

        return redirect()->route('subcontracting.orders.show', $order)
            ->with('success', 'Subcontract order updated successfully.');
    }

    public function destroy(SubcontractOrder $order): RedirectResponse
    {
        abort_if(
            ! in_array($order->status, ['draft', 'cancelled'], true),
            403,
            'Only draft or cancelled orders can be deleted.'
        );

        $order->delete();

        return redirect()->route('subcontracting.orders.index')
            ->with('success', 'Subcontract order deleted.');
    }

    public function send(SubcontractOrder $order): RedirectResponse
    {
        abort_if(! $order->canTransitionTo('sent'), 422, 'Cannot send order in current status.');

        $order->send();

        return redirect()->back()->with('success', 'Order sent to vendor.');
    }

    public function startProduction(SubcontractOrder $order): RedirectResponse
    {
        abort_if(! $order->canTransitionTo('in_progress'), 422, 'Cannot start production in current status.');

        $order->startProduction();

        return redirect()->back()->with('success', 'Production started.');
    }

    public function receive(SubcontractOrder $order): RedirectResponse
    {
        abort_if(! $order->canTransitionTo('received'), 422, 'Cannot receive order in current status.');

        $order->receive();

        return redirect()->back()->with('success', 'Finished goods received.');
    }

    public function cancel(SubcontractOrder $order): RedirectResponse
    {
        abort_if(! $order->canTransitionTo('cancelled'), 422, 'Cannot cancel order in current status.');

        $order->cancel();

        return redirect()->back()->with('success', 'Order cancelled.');
    }

    public function addComponent(Request $request, SubcontractOrder $order): RedirectResponse
    {
        abort_if($order->status !== 'draft', 403, 'Components can only be added to draft orders.');

        $validated = $request->validate([
            'component_name' => 'required|string|max:255',
            'quantity'       => 'required|numeric|min:0.0001',
            'unit'           => 'nullable|string|max:50',
        ]);

        $order->components()->create([
            'tenant_id'      => $order->tenant_id,
            'component_name' => $validated['component_name'],
            'quantity'       => $validated['quantity'],
            'unit'           => $validated['unit'] ?? 'pcs',
        ]);

        return redirect()->back()->with('success', 'Component added.');
    }

    public function removeComponent(SubcontractOrder $order, SubcontractComponent $component): RedirectResponse
    {
        abort_if($component->subcontract_id !== $order->id, 404);
        abort_if($order->status !== 'draft', 403, 'Components can only be removed from draft orders.');

        $component->delete();

        return redirect()->back()->with('success', 'Component removed.');
    }
}

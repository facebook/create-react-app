<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\Shipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShipmentController
{
    public function index(): Response
    {
        $shipments = Shipment::with('warehouse')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Inventory/Shipments/Index', compact('shipments'));
    }

    public function create(): Response
    {
        return Inertia::render('Inventory/Shipments/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type'                 => 'required|string|in:inbound,outbound',
            'carrier'              => 'nullable|string|max:255',
            'tracking_number'      => 'nullable|string|max:255',
            'service_level'        => 'nullable|string|in:standard,express,overnight',
            'origin_address'       => 'nullable|string',
            'destination_address'  => 'nullable|string',
            'ship_date'            => 'nullable|date',
            'estimated_delivery'   => 'nullable|date',
            'weight_kg'            => 'nullable|numeric|min:0',
            'freight_cost'         => 'nullable|numeric|min:0',
            'notes'                => 'nullable|string',
            'warehouse_id'         => 'nullable|exists:warehouses,id',
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        Shipment::create($data);

        return redirect()->route('inventory.shipments.index');
    }

    public function show(Shipment $shipment): Response
    {
        $shipment->load('items.product', 'warehouse', 'creator');
        return Inertia::render('Inventory/Shipments/Show', compact('shipment'));
    }

    public function edit(Shipment $shipment): Response
    {
        return Inertia::render('Inventory/Shipments/Edit', compact('shipment'));
    }

    public function update(Request $request, Shipment $shipment): RedirectResponse
    {
        $data = $request->validate([
            'carrier'             => 'nullable|string|max:255',
            'tracking_number'     => 'nullable|string|max:255',
            'service_level'       => 'nullable|string|in:standard,express,overnight',
            'origin_address'      => 'nullable|string',
            'destination_address' => 'nullable|string',
            'ship_date'           => 'nullable|date',
            'estimated_delivery'  => 'nullable|date',
            'weight_kg'           => 'nullable|numeric|min:0',
            'freight_cost'        => 'nullable|numeric|min:0',
            'notes'               => 'nullable|string',
            'warehouse_id'        => 'nullable|exists:warehouses,id',
        ]);

        $shipment->update($data);

        return redirect()->route('inventory.shipments.index');
    }

    public function destroy(Shipment $shipment): RedirectResponse
    {
        $shipment->delete();
        return redirect()->route('inventory.shipments.index');
    }

    public function dispatch(Shipment $shipment): RedirectResponse
    {
        $shipment->dispatch();
        return redirect()->route('inventory.shipments.index');
    }

    public function deliver(Shipment $shipment): RedirectResponse
    {
        $shipment->deliver();
        return redirect()->route('inventory.shipments.index');
    }

    public function returnShipment(Shipment $shipment): RedirectResponse
    {
        $shipment->returnShipment();
        return redirect()->route('inventory.shipments.index');
    }

    public function cancel(Shipment $shipment): RedirectResponse
    {
        $shipment->cancel();
        return redirect()->route('inventory.shipments.index');
    }
}

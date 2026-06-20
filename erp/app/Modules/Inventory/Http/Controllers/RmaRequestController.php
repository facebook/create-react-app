<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\RmaRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RmaRequestController
{
    public function index(): Response
    {
        $rmaRequests = RmaRequest::with('warehouse')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Inventory/RmaRequests/Index', compact('rmaRequests'));
    }

    public function create(): Response
    {
        return Inertia::render('Inventory/RmaRequests/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type'           => 'required|string|in:customer_return,supplier_return',
            'reason'         => 'required|string',
            'contact_name'   => 'nullable|string|max:255',
            'reference'      => 'nullable|string|max:255',
            'disposition'    => 'nullable|string|in:restock,scrap,repair,replace,credit',
            'requested_date' => 'nullable|date',
            'notes'          => 'nullable|string',
            'warehouse_id'   => 'nullable|exists:warehouses,id',
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        RmaRequest::create($data);

        return redirect()->route('inventory.rma-requests.index');
    }

    public function show(RmaRequest $rmaRequest): Response
    {
        $rmaRequest->load('items.product', 'warehouse', 'creator', 'approver');
        return Inertia::render('Inventory/RmaRequests/Show', compact('rmaRequest'));
    }

    public function edit(RmaRequest $rmaRequest): Response
    {
        return Inertia::render('Inventory/RmaRequests/Edit', compact('rmaRequest'));
    }

    public function update(Request $request, RmaRequest $rmaRequest): RedirectResponse
    {
        $data = $request->validate([
            'reason'         => 'required|string',
            'contact_name'   => 'nullable|string|max:255',
            'reference'      => 'nullable|string|max:255',
            'disposition'    => 'nullable|string|in:restock,scrap,repair,replace,credit',
            'requested_date' => 'nullable|date',
            'notes'          => 'nullable|string',
            'warehouse_id'   => 'nullable|exists:warehouses,id',
        ]);

        $rmaRequest->update($data);

        return redirect()->route('inventory.rma-requests.index');
    }

    public function destroy(RmaRequest $rmaRequest): RedirectResponse
    {
        $rmaRequest->delete();
        return redirect()->route('inventory.rma-requests.index');
    }

    public function approve(RmaRequest $rmaRequest): RedirectResponse
    {
        $rmaRequest->approve(auth()->id());
        return redirect()->route('inventory.rma-requests.index');
    }

    public function receive(RmaRequest $rmaRequest): RedirectResponse
    {
        $rmaRequest->receive();
        return redirect()->route('inventory.rma-requests.index');
    }

    public function inspect(RmaRequest $rmaRequest): RedirectResponse
    {
        $rmaRequest->inspect();
        return redirect()->route('inventory.rma-requests.index');
    }

    public function close(RmaRequest $rmaRequest): RedirectResponse
    {
        $rmaRequest->close();
        return redirect()->route('inventory.rma-requests.index');
    }

    public function reject(RmaRequest $rmaRequest): RedirectResponse
    {
        $rmaRequest->reject();
        return redirect()->route('inventory.rma-requests.index');
    }
}

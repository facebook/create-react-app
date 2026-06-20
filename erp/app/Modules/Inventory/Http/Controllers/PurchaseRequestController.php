<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\PurchaseRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseRequestController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', PurchaseRequest::class);

        $purchaseRequests = PurchaseRequest::orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('Inventory/PurchaseRequests/Index', compact('purchaseRequests'));
    }

    public function create(): Response
    {
        $this->authorize('create', PurchaseRequest::class);

        return Inertia::render('Inventory/PurchaseRequests/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', PurchaseRequest::class);

        $data = $request->validate([
            'title'          => 'required|string',
            'estimated_cost' => 'nullable|numeric|min:0',
            'priority'       => 'nullable|in:low,medium,high,urgent',
            'required_by'    => 'nullable|date',
        ]);

        PurchaseRequest::create([
            'tenant_id'    => app('tenant')->id,
            'created_by'   => auth()->id(),
            'requested_by' => auth()->id(),
            ...$data,
        ]);

        return redirect()->route('inventory.purchase-requests.index')
            ->with('success', 'Purchase request created.');
    }

    public function show(PurchaseRequest $purchaseRequest): Response
    {
        $this->authorize('view', $purchaseRequest);

        return Inertia::render('Inventory/PurchaseRequests/Show', compact('purchaseRequest'));
    }

    public function edit(PurchaseRequest $purchaseRequest): Response
    {
        $this->authorize('update', $purchaseRequest);

        return Inertia::render('Inventory/PurchaseRequests/Edit', compact('purchaseRequest'));
    }

    public function update(Request $request, PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $this->authorize('update', $purchaseRequest);

        $data = $request->validate([
            'title'          => 'required|string',
            'estimated_cost' => 'nullable|numeric|min:0',
            'priority'       => 'nullable|in:low,medium,high,urgent',
            'required_by'    => 'nullable|date',
        ]);

        $purchaseRequest->update($data);

        return redirect()->route('inventory.purchase-requests.index')
            ->with('success', 'Purchase request updated.');
    }

    public function destroy(PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $this->authorize('delete', $purchaseRequest);

        $purchaseRequest->delete();

        return redirect()->route('inventory.purchase-requests.index')
            ->with('success', 'Purchase request deleted.');
    }

    public function submit(PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $this->authorize('submit', $purchaseRequest);

        $purchaseRequest->submit();

        return redirect()->route('inventory.purchase-requests.index')
            ->with('success', 'Purchase request submitted.');
    }

    public function approve(PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $this->authorize('approve', $purchaseRequest);

        $purchaseRequest->approve(auth()->id());

        return redirect()->route('inventory.purchase-requests.index')
            ->with('success', 'Purchase request approved.');
    }

    public function reject(PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $this->authorize('reject', $purchaseRequest);

        $purchaseRequest->reject();

        return redirect()->route('inventory.purchase-requests.index')
            ->with('success', 'Purchase request rejected.');
    }

    public function markOrdered(PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $this->authorize('markOrdered', $purchaseRequest);

        $purchaseRequest->markOrdered();

        return redirect()->route('inventory.purchase-requests.index')
            ->with('success', 'Purchase request marked as ordered.');
    }

    public function cancel(PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $this->authorize('cancel', $purchaseRequest);

        $purchaseRequest->cancel();

        return redirect()->route('inventory.purchase-requests.index')
            ->with('success', 'Purchase request cancelled.');
    }
}

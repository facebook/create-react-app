<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\PurchaseRequisition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseRequisitionController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', PurchaseRequisition::class);
        $requisitions = PurchaseRequisition::with(['requester', 'approver'])
            ->orderByDesc('created_at')
            ->paginate(25);
        return Inertia::render('Inventory/PurchaseRequisitions/Index', compact('requisitions'));
    }

    public function create(): Response
    {
        $this->authorize('create', PurchaseRequisition::class);
        $products = Product::orderBy('name')->get(['id', 'name', 'sku', 'cost_price']);
        return Inertia::render('Inventory/PurchaseRequisitions/Create', compact('products'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', PurchaseRequisition::class);
        $data = $request->validate([
            'reference'                       => 'required|string|max:100|unique:purchase_requisitions,reference',
            'needed_by'                       => 'nullable|date',
            'notes'                           => 'nullable|string',
            'items'                           => 'required|array|min:1',
            'items.*.description'             => 'required|string',
            'items.*.product_id'              => 'nullable|exists:products,id',
            'items.*.quantity'                => 'required|numeric|min:0.01',
            'items.*.estimated_unit_cost'     => 'required|numeric|min:0',
        ]);

        $pr = PurchaseRequisition::create([
            'tenant_id'    => auth()->user()->tenant_id,
            'reference'    => $data['reference'],
            'requested_by' => auth()->id(),
            'status'       => 'draft',
            'needed_by'    => $data['needed_by'] ?? null,
            'notes'        => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            $pr->items()->create([
                'product_id'          => $item['product_id'] ?? null,
                'description'         => $item['description'],
                'quantity'            => $item['quantity'],
                'estimated_unit_cost' => $item['estimated_unit_cost'],
            ]);
        }

        return redirect()->route('inventory.purchase-requisitions.show', $pr)
            ->with('success', 'Purchase requisition created.');
    }

    public function show(PurchaseRequisition $purchaseRequisition): Response
    {
        $this->authorize('view', $purchaseRequisition);
        $purchaseRequisition->load(['requester', 'approver', 'items.product']);
        return Inertia::render('Inventory/PurchaseRequisitions/Show', compact('purchaseRequisition'));
    }

    public function submit(PurchaseRequisition $purchaseRequisition): RedirectResponse
    {
        $this->authorize('update', $purchaseRequisition);
        abort_unless($purchaseRequisition->status === 'draft', 422, 'Only drafts can be submitted.');
        $purchaseRequisition->update(['status' => 'submitted']);
        return back()->with('success', 'Requisition submitted for approval.');
    }

    public function approve(PurchaseRequisition $purchaseRequisition): RedirectResponse
    {
        $this->authorize('approve', $purchaseRequisition);
        abort_unless($purchaseRequisition->status === 'submitted', 422, 'Only submitted requisitions can be approved.');
        $purchaseRequisition->update([
            'status'      => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);
        return back()->with('success', 'Requisition approved.');
    }

    public function reject(PurchaseRequisition $purchaseRequisition, Request $request): RedirectResponse
    {
        $this->authorize('approve', $purchaseRequisition);
        abort_unless($purchaseRequisition->status === 'submitted', 422, 'Only submitted requisitions can be rejected.');
        $request->validate(['rejection_reason' => 'required|string']);
        $purchaseRequisition->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);
        return back()->with('success', 'Requisition rejected.');
    }

    public function destroy(PurchaseRequisition $purchaseRequisition): RedirectResponse
    {
        $this->authorize('delete', $purchaseRequisition);
        abort_unless($purchaseRequisition->status === 'draft', 422, 'Only drafts can be deleted.');
        $purchaseRequisition->delete();
        return redirect()->route('inventory.purchase-requisitions.index')->with('success', 'Requisition deleted.');
    }
}

<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\SupplierContract;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierContractController extends Controller
{
    public function index(Request $request): Response
    {
        $contracts = SupplierContract::with('supplier')
            ->when($request->supplier_id, fn ($q) => $q->where('supplier_id', $request->supplier_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/SupplierContracts/Index', [
            'contracts' => $contracts,
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'filters'   => $request->only(['supplier_id', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id'    => 'required|exists:suppliers,id',
            'title'          => 'required|string|max:255',
            'contract_number'=> 'nullable|string|max:255',
            'start_date'     => 'required|date',
            'end_date'       => 'nullable|date|after:start_date',
            'value'          => 'nullable|numeric',
            'payment_terms'  => 'nullable|string|max:255',
            'status'         => 'required|in:active,expired,terminated',
            'terms'          => 'nullable|string',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        SupplierContract::create($validated);

        return back()->with('success', 'Contract created successfully.');
    }

    public function destroy(SupplierContract $supplierContract): RedirectResponse
    {
        $this->authorize('delete', $supplierContract);
        $supplierContract->delete();

        return back()->with('success', 'Contract deleted.');
    }

    public function terminate(Request $request, SupplierContract $supplierContract): RedirectResponse
    {
        $supplierContract->update(['status' => 'terminated']);

        return back()->with('success', 'Contract terminated.');
    }
}

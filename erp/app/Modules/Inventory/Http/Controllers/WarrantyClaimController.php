<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\ProductWarranty;
use App\Modules\Inventory\Models\WarrantyClaim;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarrantyClaimController
{
    public function index(): Response
    {
        $warrantyClaims = WarrantyClaim::with('warranty.product', 'serialNumber')
            ->orderByDesc('claim_date')
            ->paginate(20);

        return Inertia::render('Inventory/WarrantyClaims/Index', compact('warrantyClaims'));
    }

    public function create(): Response
    {
        $warranties = ProductWarranty::with('product')->orderBy('name')->get()
            ->map(fn ($w) => [
                'id'      => $w->id,
                'name'    => $w->name,
                'product' => $w->product ? ['id' => $w->product->id, 'name' => $w->product->name] : null,
            ]);

        return Inertia::render('Inventory/WarrantyClaims/Create', compact('warranties'));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'claim_date'          => 'required|date',
            'customer_name'       => 'required|string|max:255',
            'product_warranty_id' => 'required|exists:product_warranties,id',
            'serial_number_id'    => 'nullable|exists:serial_numbers,id',
            'customer_email'      => 'nullable|email|max:255',
            'customer_phone'      => 'nullable|string|max:50',
            'purchase_date'       => 'nullable|date',
            'warranty_expiry'     => 'nullable|date',
            'issue_description'   => 'required|string',
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        WarrantyClaim::create($data);

        return redirect()->route('inventory.warranty-claims.index');
    }

    public function show(WarrantyClaim $warrantyClaim): Response
    {
        $warrantyClaim->load('warranty.product', 'serialNumber', 'creator', 'assignee');

        return Inertia::render('Inventory/WarrantyClaims/Show', compact('warrantyClaim'));
    }

    public function destroy(WarrantyClaim $warrantyClaim): RedirectResponse
    {
        $warrantyClaim->delete();

        return redirect()->route('inventory.warranty-claims.index');
    }

    public function approve(WarrantyClaim $warrantyClaim): RedirectResponse
    {
        $warrantyClaim->approve();

        return redirect()->route('inventory.warranty-claims.index');
    }

    public function reject(WarrantyClaim $warrantyClaim): RedirectResponse
    {
        $warrantyClaim->reject();

        return redirect()->route('inventory.warranty-claims.index');
    }

    public function resolve(Request $request, WarrantyClaim $warrantyClaim): RedirectResponse
    {
        $data = $request->validate([
            'resolution_type'  => 'required|string|in:repair,replace,refund,reject',
            'resolution_notes' => 'nullable|string',
        ]);

        $warrantyClaim->resolve($data['resolution_type'], $data['resolution_notes'] ?? null);

        return redirect()->route('inventory.warranty-claims.index');
    }
}

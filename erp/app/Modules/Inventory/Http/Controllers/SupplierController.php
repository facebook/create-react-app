<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Http\Requests\StoreSupplierRequest;
use App\Modules\Inventory\Http\Resources\SupplierResource;
use App\Modules\Inventory\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $suppliers = Supplier::when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Inventory/Suppliers/Index', [
            'suppliers'   => SupplierResource::collection($suppliers),
            'filters'     => $request->only(['search']),
            'breadcrumbs' => [
                ['label' => 'Inventory'],
                ['label' => 'Suppliers', 'href' => route('inventory.suppliers.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Inventory/Suppliers/Create', [
            'breadcrumbs' => [
                ['label' => 'Inventory'],
                ['label' => 'Suppliers', 'href' => route('inventory.suppliers.index')],
                ['label' => 'New Supplier'],
            ],
        ]);
    }

    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        Supplier::create([...$request->validated(), 'tenant_id' => auth()->user()->tenant_id]);

        return redirect()->route('inventory.suppliers.index')
            ->with('success', 'Supplier created successfully.');
    }

    public function show(Supplier $supplier): Response
    {
        $supplier->load(['reviews', 'contracts']);

        return Inertia::render('Inventory/Suppliers/Show', [
            'supplier'      => array_merge($supplier->toArray(), [
                'average_rating' => $supplier->average_rating,
            ]),
            'breadcrumbs'   => [
                ['label' => 'Inventory'],
                ['label' => 'Suppliers', 'href' => route('inventory.suppliers.index')],
                ['label' => $supplier->name],
            ],
        ]);
    }

    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('Inventory/Suppliers/Edit', [
            'supplier'    => new SupplierResource($supplier),
            'breadcrumbs' => [
                ['label' => 'Inventory'],
                ['label' => 'Suppliers', 'href' => route('inventory.suppliers.index')],
                ['label' => $supplier->name, 'href' => route('inventory.suppliers.edit', $supplier)],
                ['label' => 'Edit'],
            ],
        ]);
    }

    public function update(StoreSupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $supplier->update($request->validated());

        return redirect()->route('inventory.suppliers.index')
            ->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $supplier->delete();

        return redirect()->route('inventory.suppliers.index')
            ->with('success', 'Supplier deleted.');
    }
}

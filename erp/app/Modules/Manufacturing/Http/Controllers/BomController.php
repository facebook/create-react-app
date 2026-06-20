<?php

namespace App\Modules\Manufacturing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Manufacturing\Models\BillOfMaterials;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BomController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', BillOfMaterials::class);

        $boms = BillOfMaterials::with('product')
            ->withCount('lines')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('code', 'like', "%{$request->search}%"))
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Manufacturing/BillsOfMaterials/Index', [
            'boms'    => $boms,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', BillOfMaterials::class);

        return Inertia::render('Manufacturing/BillsOfMaterials/Create', [
            'products' => Product::orderBy('name')->get(['id', 'name', 'sku']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BillOfMaterials::class);

        $validated = $request->validate([
            'product_id'  => 'required|exists:products,id',
            'name'        => 'required|string|max:255',
            'code'        => 'nullable|string|max:100',
            'type'        => 'required|in:manufacture,kit,subcontracting',
            'qty_per_bom' => 'required|numeric|min:0.0001',
            'uom'         => 'nullable|string|max:50',
            'is_active'   => 'boolean',
            'notes'       => 'nullable|string',
            'lines'       => 'array',
            'lines.*.component_id' => 'required|exists:products,id',
            'lines.*.quantity'     => 'required|numeric|min:0.0001',
            'lines.*.uom'          => 'nullable|string|max:50',
            'lines.*.sequence'     => 'nullable|integer|min:1',
            'lines.*.is_optional'  => 'boolean',
            'lines.*.notes'        => 'nullable|string',
        ]);

        $bom = BillOfMaterials::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        foreach ($validated['lines'] ?? [] as $line) {
            $bom->lines()->create($line);
        }

        return redirect()->route('manufacturing.boms.index')
            ->with('success', 'Bill of Materials created successfully.');
    }

    public function show(BillOfMaterials $bom): Response
    {
        $this->authorize('view', $bom);

        $bom->load(['product', 'lines.component']);

        return Inertia::render('Manufacturing/BillsOfMaterials/Show', [
            'bom' => $bom,
        ]);
    }

    public function edit(BillOfMaterials $bom): Response
    {
        $this->authorize('update', $bom);

        $bom->load(['product', 'lines.component']);

        return Inertia::render('Manufacturing/BillsOfMaterials/Edit', [
            'bom'      => $bom,
            'products' => Product::orderBy('name')->get(['id', 'name', 'sku']),
        ]);
    }

    public function update(Request $request, BillOfMaterials $bom): RedirectResponse
    {
        $this->authorize('update', $bom);

        $validated = $request->validate([
            'product_id'  => 'required|exists:products,id',
            'name'        => 'required|string|max:255',
            'code'        => 'nullable|string|max:100',
            'type'        => 'required|in:manufacture,kit,subcontracting',
            'qty_per_bom' => 'required|numeric|min:0.0001',
            'uom'         => 'nullable|string|max:50',
            'is_active'   => 'boolean',
            'notes'       => 'nullable|string',
            'lines'       => 'array',
            'lines.*.component_id' => 'required|exists:products,id',
            'lines.*.quantity'     => 'required|numeric|min:0.0001',
            'lines.*.uom'          => 'nullable|string|max:50',
            'lines.*.sequence'     => 'nullable|integer|min:1',
            'lines.*.is_optional'  => 'boolean',
            'lines.*.notes'        => 'nullable|string',
        ]);

        $bom->update($validated);

        // Sync lines: delete old, insert new
        $bom->lines()->delete();
        foreach ($validated['lines'] ?? [] as $line) {
            $bom->lines()->create($line);
        }

        return redirect()->route('manufacturing.boms.show', $bom)
            ->with('success', 'Bill of Materials updated successfully.');
    }

    public function destroy(BillOfMaterials $bom): RedirectResponse
    {
        $this->authorize('delete', $bom);

        $bom->delete();

        return redirect()->route('manufacturing.boms.index')
            ->with('success', 'Bill of Materials deleted successfully.');
    }
}

<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\QcChecklist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class QcChecklistController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', QcChecklist::class);

        $checklists = QcChecklist::with('product')
            ->withCount('items')
            ->orderByDesc('created_at')
            ->paginate(15);

        return Inertia::render('Inventory/QcChecklists/Index', compact('checklists'));
    }

    public function create(): Response
    {
        $this->authorize('create', QcChecklist::class);

        $products = Product::orderBy('name')->get(['id', 'name', 'sku']);

        return Inertia::render('Inventory/QcChecklists/Create', compact('products'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', QcChecklist::class);

        $validated = $request->validate([
            'name'                => ['required', 'string', 'max:255'],
            'product_id'          => ['nullable', Rule::exists('products', 'id')],
            'description'         => ['nullable', 'string'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.name'        => ['required', 'string', 'max:255'],
            'items.*.is_required' => ['boolean'],
            'items.*.sort_order'  => ['nullable', 'integer', 'min:0'],
        ]);

        $tenantId = auth()->user()->tenant_id;

        $checklist = QcChecklist::create([
            'tenant_id'   => $tenantId,
            'name'        => $validated['name'],
            'product_id'  => $validated['product_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active'   => true,
        ]);

        foreach ($validated['items'] as $item) {
            $checklist->items()->create([
                'tenant_id'   => $tenantId,
                'name'        => $item['name'],
                'is_required' => $item['is_required'] ?? true,
                'sort_order'  => $item['sort_order'] ?? 0,
            ]);
        }

        return redirect()->route('inventory.qc-checklists.show', $checklist)
            ->with('success', 'Checklist created successfully.');
    }

    public function show(QcChecklist $qcChecklist): Response
    {
        $this->authorize('view', $qcChecklist);

        $qcChecklist->load(['product', 'items']);

        return Inertia::render('Inventory/QcChecklists/Show', [
            'checklist' => $qcChecklist,
        ]);
    }

    public function destroy(QcChecklist $qcChecklist): RedirectResponse
    {
        $this->authorize('delete', $qcChecklist);

        $qcChecklist->delete();

        return redirect()->route('inventory.qc-checklists.index')
            ->with('success', 'Checklist deleted.');
    }
}

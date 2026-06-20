<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\QcChecklist;
use App\Modules\Inventory\Models\QcInspection;
use App\Modules\Inventory\Models\QcInspectionResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class QcInspectionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', QcInspection::class);

        $inspections = QcInspection::with(['checklist', 'product', 'inspector'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventory/QcInspections/Index', [
            'inspections' => $inspections,
            'filters'     => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', QcInspection::class);

        $checklists = QcChecklist::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $products   = Product::orderBy('name')->get(['id', 'name', 'sku']);

        return Inertia::render('Inventory/QcInspections/Create', compact('checklists', 'products'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', QcInspection::class);

        $validated = $request->validate([
            'qc_checklist_id' => ['required', Rule::exists('qc_checklists', 'id')],
            'product_id'      => ['nullable', Rule::exists('products', 'id')],
            'batch_reference' => ['nullable', 'string', 'max:100'],
            'notes'           => ['nullable', 'string'],
        ]);

        $tenantId = auth()->user()->tenant_id;

        $inspection = QcInspection::create([
            'tenant_id'       => $tenantId,
            'qc_checklist_id' => $validated['qc_checklist_id'],
            'product_id'      => $validated['product_id'] ?? null,
            'batch_reference' => $validated['batch_reference'] ?? null,
            'notes'           => $validated['notes'] ?? null,
            'status'          => 'pending',
        ]);

        $checklist = QcChecklist::with('items')->find($validated['qc_checklist_id']);
        foreach ($checklist->items as $item) {
            QcInspectionResult::create([
                'tenant_id'            => $tenantId,
                'qc_inspection_id'     => $inspection->id,
                'qc_checklist_item_id' => $item->id,
                'result'               => 'na',
            ]);
        }

        return redirect()->route('inventory.qc-inspections.show', $inspection)
            ->with('success', 'Inspection created successfully.');
    }

    public function show(QcInspection $qcInspection): Response
    {
        $this->authorize('view', $qcInspection);

        $qcInspection->load(['checklist.items', 'results.checklistItem', 'product', 'inspector']);

        return Inertia::render('Inventory/QcInspections/Show', [
            'inspection' => $qcInspection->append('pass_rate'),
        ]);
    }

    public function destroy(QcInspection $qcInspection): RedirectResponse
    {
        $this->authorize('delete', $qcInspection);

        $qcInspection->delete();

        return redirect()->route('inventory.qc-inspections.index')
            ->with('success', 'Inspection deleted.');
    }

    public function updateResult(Request $request, QcInspection $qcInspection, QcInspectionResult $result): RedirectResponse
    {
        $this->authorize('create', $qcInspection);

        $validated = $request->validate([
            'result' => ['required', Rule::in(['pass', 'fail', 'na'])],
            'notes'  => ['nullable', 'string'],
        ]);

        $result->update($validated);

        return redirect()->back()->with('success', 'Result updated.');
    }

    public function complete(Request $request, QcInspection $qcInspection): RedirectResponse
    {
        $this->authorize('create', $qcInspection);

        $validated = $request->validate([
            'overall_result' => ['required', Rule::in(['pass', 'fail', 'conditional'])],
        ]);

        $qcInspection->complete($validated['overall_result']);

        return redirect()->back()->with('success', 'Inspection completed.');
    }
}

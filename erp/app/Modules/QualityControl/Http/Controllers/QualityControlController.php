<?php

namespace App\Modules\QualityControl\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\QualityControl\Models\NonConformanceReport;
use App\Modules\QualityControl\Models\QcChecklist;
use App\Modules\QualityControl\Models\QcInspection;
use App\Modules\QualityControl\Models\QcInspectionResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QualityControlController extends Controller
{
    public function dashboard(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $openNcrs = NonConformanceReport::whereIn('status', ['open', 'under_review'])->count();

        $failedInspections = QcInspection::where('status', 'failed')->count();

        $pendingInspections = QcInspection::where('status', 'pending')->count();

        $inspections = QcInspection::with('results')
            ->whereIn('status', ['passed', 'failed'])
            ->get();

        $passRate = 0.0;
        if ($inspections->isNotEmpty()) {
            $total = $inspections->sum(fn ($i) => $i->results->count());
            $passes = $inspections->sum(fn ($i) => $i->results->where('result', 'pass')->count());
            $passRate = $total > 0 ? round(($passes / $total) * 100, 1) : 0.0;
        }

        return Inertia::render('QualityControl/Dashboard', [
            'stats' => [
                'open_ncrs'           => $openNcrs,
                'failed_inspections'  => $failedInspections,
                'pending_inspections' => $pendingInspections,
                'pass_rate'           => $passRate,
            ],
        ]);
    }

    public function checklists(): Response
    {
        $checklists = QcChecklist::withCount('items')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('QualityControl/Checklists/Index', [
            'checklists' => $checklists,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return $this->storeChecklist($request);
    }

    public function storeChecklist(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'required|in:incoming,process,final,audit',
            'is_active'   => 'boolean',
        ]);

        QcChecklist::create([
            'tenant_id'   => auth()->user()->tenant_id,
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'category'    => $data['category'],
            'is_active'   => $data['is_active'] ?? true,
            'created_by'  => auth()->id(),
        ]);

        return redirect()->route('quality.checklists.index')
            ->with('success', 'Checklist created.');
    }

    public function storeChecklistItem(Request $request, QcChecklist $checklist): RedirectResponse
    {
        $data = $request->validate([
            'description'    => 'required|string',
            'check_type'     => 'required|in:pass_fail,measurement,visual,count',
            'expected_value' => 'nullable|string|max:255',
            'unit'           => 'nullable|string|max:50',
            'is_required'    => 'boolean',
            'sequence'       => 'integer|min:0',
        ]);

        $checklist->items()->create([
            'tenant_id'      => auth()->user()->tenant_id,
            'description'    => $data['description'],
            'check_type'     => $data['check_type'],
            'expected_value' => $data['expected_value'] ?? null,
            'unit'           => $data['unit'] ?? null,
            'is_required'    => $data['is_required'] ?? true,
            'sequence'       => $data['sequence'] ?? 0,
        ]);

        return back()->with('success', 'Item added to checklist.');
    }

    public function inspections(): Response
    {
        $inspections = QcInspection::with(['checklist', 'inspector'])
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $checklists = QcChecklist::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('QualityControl/Inspections/Index', [
            'inspections' => $inspections,
            'checklists'  => $checklists,
        ]);
    }

    public function createInspection(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'checklist_id'   => 'required|exists:quality_checklists,id',
            'reference_type' => 'nullable|string|max:100',
            'reference_id'   => 'nullable|integer',
            'inspector_id'   => 'nullable|exists:users,id',
        ]);

        QcInspection::create([
            'tenant_id'      => auth()->user()->tenant_id,
            'checklist_id'   => $data['checklist_id'],
            'reference_type' => $data['reference_type'] ?? null,
            'reference_id'   => $data['reference_id'] ?? null,
            'inspector_id'   => $data['inspector_id'] ?? null,
            'status'         => 'pending',
        ]);

        return redirect()->route('quality.inspections.index')
            ->with('success', 'Inspection created.');
    }

    public function startInspection(QcInspection $inspection): RedirectResponse
    {
        $inspection->start();

        return back()->with('success', 'Inspection started.');
    }

    public function submitResults(Request $request, QcInspection $inspection): RedirectResponse
    {
        $data = $request->validate([
            'results'                        => 'required|array',
            'results.*.checklist_item_id'    => 'required|exists:quality_checklist_items,id',
            'results.*.result'               => 'required|in:pass,fail,na',
            'results.*.measured_value'       => 'nullable|string|max:255',
            'results.*.notes'                => 'nullable|string',
        ]);

        foreach ($data['results'] as $resultData) {
            QcInspectionResult::create([
                'tenant_id'         => auth()->user()->tenant_id,
                'inspection_id'     => $inspection->id,
                'checklist_item_id' => $resultData['checklist_item_id'],
                'result'            => $resultData['result'],
                'measured_value'    => $resultData['measured_value'] ?? null,
                'notes'             => $resultData['notes'] ?? null,
            ]);
        }

        $hasFail = collect($data['results'])->contains('result', 'fail');
        $outcome = $hasFail ? 'failed' : 'passed';
        $inspection->complete($outcome);

        return back()->with('success', 'Results submitted. Inspection marked as ' . $outcome . '.');
    }

    public function ncrs(): Response
    {
        $ncrs = NonConformanceReport::with(['reporter', 'assignee', 'inspection'])
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $inspections = QcInspection::orderBy('id', 'desc')->get(['id']);

        return Inertia::render('QualityControl/NCR/Index', [
            'ncrs'        => $ncrs,
            'inspections' => $inspections,
        ]);
    }

    public function storeNcr(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'required|string',
            'severity'      => 'required|in:minor,major,critical',
            'inspection_id' => 'nullable|exists:quality_inspections,id',
            'due_date'      => 'nullable|date',
        ]);

        $tenantId = auth()->user()->tenant_id;

        NonConformanceReport::create([
            'tenant_id'     => $tenantId,
            'inspection_id' => $data['inspection_id'] ?? null,
            'ncr_number'    => NonConformanceReport::generateNumber($tenantId),
            'title'         => $data['title'],
            'description'   => $data['description'],
            'severity'      => $data['severity'],
            'due_date'      => $data['due_date'] ?? null,
            'reported_by'   => auth()->id(),
            'status'        => 'open',
        ]);

        return redirect()->route('quality.ncrs.index')
            ->with('success', 'NCR created.');
    }

    public function resolveNcr(Request $request, NonConformanceReport $ncr): RedirectResponse
    {
        $data = $request->validate([
            'root_cause'        => 'required|string',
            'corrective_action' => 'required|string',
        ]);

        $ncr->resolve($data['root_cause'], $data['corrective_action']);

        return back()->with('success', 'NCR resolved.');
    }
}

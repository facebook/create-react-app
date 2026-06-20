<?php

namespace App\Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\CrmStage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CrmLeadController extends Controller
{
    public function index(Request $request): Response
    {
        $leads = CrmLead::with(['stage', 'assignee'])
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->stage_id, fn ($q) => $q->where('stage_id', $request->stage_id))
            ->when($request->assigned_to, fn ($q) => $q->where('assigned_to', $request->assigned_to))
            ->when($request->search, fn ($q) => $q->where(function ($q2) use ($request) {
                $q2->where('title', 'like', "%{$request->search}%")
                   ->orWhere('contact_name', 'like', "%{$request->search}%");
            }))
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('CRM/Leads/Index', [
            'leads'   => $leads,
            'filters' => $request->only(['type', 'status', 'stage_id', 'assigned_to', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('CRM/Leads/Create', [
            'stages' => CrmStage::where('is_active', true)->orderBy('sequence')->get(['id', 'name', 'type']),
            'users'  => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'               => 'required|string|max:255',
            'type'                => 'required|in:lead,opportunity',
            'stage_id'            => 'nullable|exists:crm_stages,id',
            'contact_name'        => 'nullable|string|max:255',
            'company_name'        => 'nullable|string|max:255',
            'email'               => 'nullable|email|max:255',
            'phone'               => 'nullable|string|max:50',
            'website'             => 'nullable|string|max:255',
            'source'              => 'nullable|string|max:50',
            'expected_revenue'    => 'nullable|numeric|min:0',
            'probability'         => 'nullable|numeric|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'priority'            => 'required|in:low,normal,high,urgent',
            'description'         => 'nullable|string',
            'assigned_to'         => 'nullable|exists:users,id',
        ]);

        $lead = CrmLead::create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        if (! $lead->reference) {
            $lead->reference = $lead->generateReference();
            $lead->saveQuietly();
        }

        return redirect()->route('crm.leads.show', $lead)->with('success', 'Lead created.');
    }

    public function show(CrmLead $lead): Response
    {
        $lead->load(['stage', 'assignee', 'activities.assignee']);

        return Inertia::render('CRM/Leads/Show', [
            'lead'   => $lead,
            'stages' => CrmStage::where('is_active', true)->orderBy('sequence')->get(['id', 'name']),
            'users'  => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function edit(CrmLead $lead): Response
    {
        return Inertia::render('CRM/Leads/Edit', [
            'lead'   => $lead,
            'stages' => CrmStage::where('is_active', true)->orderBy('sequence')->get(['id', 'name', 'type']),
            'users'  => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, CrmLead $lead): RedirectResponse
    {
        $validated = $request->validate([
            'title'               => 'required|string|max:255',
            'type'                => 'required|in:lead,opportunity',
            'stage_id'            => 'nullable|exists:crm_stages,id',
            'contact_name'        => 'nullable|string|max:255',
            'company_name'        => 'nullable|string|max:255',
            'email'               => 'nullable|email|max:255',
            'phone'               => 'nullable|string|max:50',
            'website'             => 'nullable|string|max:255',
            'source'              => 'nullable|string|max:50',
            'expected_revenue'    => 'nullable|numeric|min:0',
            'probability'         => 'nullable|numeric|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'priority'            => 'required|in:low,normal,high,urgent',
            'description'         => 'nullable|string',
            'assigned_to'         => 'nullable|exists:users,id',
        ]);

        $lead->update($validated);

        return redirect()->route('crm.leads.show', $lead)->with('success', 'Lead updated.');
    }

    public function destroy(CrmLead $lead): RedirectResponse
    {
        $lead->delete();

        return redirect()->route('crm.leads.index')->with('success', 'Lead deleted.');
    }

    public function markWon(CrmLead $lead): RedirectResponse
    {
        $lead->markWon();

        return redirect()->route('crm.leads.show', $lead)->with('success', 'Lead marked as won.');
    }

    public function markLost(Request $request, CrmLead $lead): RedirectResponse
    {
        $request->validate([
            'lost_reason' => 'nullable|string|max:1000',
        ]);

        $lead->markLost($request->lost_reason ?? '');

        return redirect()->route('crm.leads.show', $lead)->with('success', 'Lead marked as lost.');
    }

    public function convert(CrmLead $lead): RedirectResponse
    {
        $lead->convertToOpportunity();

        return redirect()->route('crm.leads.show', $lead)->with('success', 'Converted to opportunity.');
    }

    public function kanban(Request $request): Response
    {
        $stages = \App\Modules\CRM\Models\CrmStage::orderBy('sequence')->get(['id', 'name', 'color']);
        $leads  = CrmLead::with(['stage', 'assignee'])
            ->where('type', 'opportunity')
            ->whereNotIn('status', ['lost'])
            ->get()
            ->groupBy('stage_id');

        $columns = $stages->map(fn ($stage) => [
            'id'    => $stage->id,
            'name'  => $stage->name,
            'color' => $stage->color ?? '#6b7280',
            'leads' => ($leads->get($stage->id) ?? collect())->map(fn ($l) => [
                'id'               => $l->id,
                'title'            => $l->title,
                'contact_name'     => $l->contact_name,
                'expected_revenue' => $l->expected_revenue,
                'probability'      => $l->probability,
                'priority'         => $l->priority,
                'assignee'         => $l->assignee ? ['name' => $l->assignee->name] : null,
            ])->values(),
        ]);

        return Inertia::render('CRM/Pipeline/Kanban', ['columns' => $columns]);
    }

    public function moveStage(Request $request, CrmLead $lead): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate(['stage_id' => 'required|exists:crm_stages,id']);
        $lead->update(['stage_id' => $data['stage_id']]);
        return response()->json(['ok' => true]);
    }
}

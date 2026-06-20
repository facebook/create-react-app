<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Finance\Models\Lead;
use App\Modules\Finance\Models\LeadActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Lead::class);

        $query = Lead::with('assignedTo');

        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }

        $leads = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Finance/Leads/Index', [
            'leads'   => $leads,
            'filters' => $request->only('stage'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Lead::class);

        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Finance/Leads/Create', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Lead::class);

        $data = $request->validate([
            'name'                => ['required', 'string'],
            'email'               => ['nullable', 'email'],
            'phone'               => ['nullable', 'string', 'max:30'],
            'company'             => ['nullable', 'string'],
            'source'              => ['required', 'in:website,referral,cold_call,trade_show,social_media,other'],
            'stage'               => ['nullable', 'in:new,contacted,qualified,proposal,negotiation,won,lost'],
            'estimated_value'     => ['nullable', 'numeric'],
            'probability'         => ['nullable', 'integer', 'min:0', 'max:100'],
            'notes'               => ['nullable', 'string'],
            'assigned_to'         => ['nullable', 'exists:users,id'],
            'expected_close_date' => ['nullable', 'date'],
        ]);

        $data['tenant_id'] = app('tenant')->id;
        $data['stage']     = $data['stage'] ?? 'new';

        $lead = Lead::create($data);

        return redirect()->route('finance.leads.show', $lead);
    }

    public function show(Lead $lead): Response
    {
        $this->authorize('view', $lead);

        $lead->load(['activities' => function ($q) {
            $q->with('user')->orderBy('activity_date', 'desc');
        }]);

        $lead->append('weighted_value');

        return Inertia::render('Finance/Leads/Show', [
            'lead' => $lead,
        ]);
    }

    public function update(Request $request, Lead $lead): RedirectResponse
    {
        $this->authorize('update', $lead);

        $data = $request->validate([
            'stage'               => ['nullable', 'in:new,contacted,qualified,proposal,negotiation,won,lost'],
            'probability'         => ['nullable', 'integer', 'min:0', 'max:100'],
            'estimated_value'     => ['nullable', 'numeric'],
            'notes'               => ['nullable', 'string'],
            'expected_close_date' => ['nullable', 'date'],
            'assigned_to'         => ['nullable', 'exists:users,id'],
        ]);

        $lead->update($data);

        return back()->with('success', 'Lead updated successfully.');
    }

    public function destroy(Lead $lead): RedirectResponse
    {
        $this->authorize('delete', $lead);

        $lead->delete();

        return redirect()->route('finance.leads.index');
    }

    public function markWon(Lead $lead): RedirectResponse
    {
        $this->authorize('update', $lead);

        $lead->markWon();

        return back()->with('success', 'Lead marked as won.');
    }

    public function markLost(Request $request, Lead $lead): RedirectResponse
    {
        $this->authorize('update', $lead);

        $data = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $lead->markLost($data['reason']);

        return back()->with('success', 'Lead marked as lost.');
    }

    public function addActivity(Request $request, Lead $lead): RedirectResponse
    {
        $this->authorize('create', Lead::class);

        $data = $request->validate([
            'type'             => ['required', 'in:call,email,meeting,note,task'],
            'description'      => ['required', 'string'],
            'activity_date'    => ['required', 'date'],
            'outcome'          => ['nullable', 'string'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
        ]);

        $data['tenant_id'] = app('tenant')->id;
        $data['lead_id']   = $lead->id;
        $data['user_id']   = auth()->id();

        LeadActivity::create($data);

        return back()->with('success', 'Activity added successfully.');
    }
}

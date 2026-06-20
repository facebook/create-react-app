<?php

namespace App\Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\EmailSequence;
use App\Modules\CRM\Models\EmailSequenceEnrollment;
use App\Modules\CRM\Models\EmailSequenceStep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailSequenceController extends Controller
{
    public function index(): Response
    {
        $sequences = EmailSequence::withCount(['steps', 'enrollments'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('CRM/EmailSequences/Index', [
            'sequences' => $sequences,
        ]);
    }

    public function show(EmailSequence $sequence): Response
    {
        $sequence->load(['steps', 'enrollments.lead']);

        return Inertia::render('CRM/EmailSequences/Show', [
            'sequence' => $sequence,
            'leads'    => CrmLead::where('status', 'open')->orderBy('contact_name')->get(['id', 'contact_name', 'email', 'company_name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $sequence = EmailSequence::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->route('crm.sequences.show', $sequence)->with('success', 'Sequence created.');
    }

    public function storeStep(Request $request, EmailSequence $sequence): RedirectResponse
    {
        $validated = $request->validate([
            'subject'    => 'required|string|max:255',
            'body'       => 'required|string',
            'delay_days' => 'nullable|integer|min:0',
        ]);

        $stepNumber = $sequence->steps()->max('step_number') + 1;

        EmailSequenceStep::create([
            ...$validated,
            'tenant_id'   => auth()->user()->tenant_id,
            'sequence_id' => $sequence->id,
            'step_number' => $stepNumber,
            'delay_days'  => $validated['delay_days'] ?? 1,
        ]);

        $sequence->increment('total_steps');

        return back()->with('success', 'Step added.');
    }

    public function enroll(Request $request, EmailSequence $sequence): RedirectResponse
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:crm_leads,id',
        ]);

        $lead = CrmLead::findOrFail($validated['lead_id']);
        $sequence->enrollLead($lead);

        return back()->with('success', 'Lead enrolled in sequence.');
    }

    public function pause(EmailSequence $sequence): RedirectResponse
    {
        $sequence->pause();

        return back()->with('success', 'Sequence paused.');
    }

    public function activate(EmailSequence $sequence): RedirectResponse
    {
        $sequence->activate();

        return back()->with('success', 'Sequence activated.');
    }

    public function unsubscribe(EmailSequenceEnrollment $enrollment): RedirectResponse
    {
        $enrollment->unsubscribe();

        return back()->with('success', 'Lead unsubscribed from sequence.');
    }
}

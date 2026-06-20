<?php

namespace App\Modules\Helpdesk\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Helpdesk\Models\HelpdeskSlaPolicy;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use App\Modules\Helpdesk\Models\TicketEscalation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SlaController extends Controller
{
    public function policies(): Response
    {
        $policies = HelpdeskSlaPolicy::orderBy('priority')->get();

        return Inertia::render('Helpdesk/Sla/Policies', [
            'policies' => $policies,
        ]);
    }

    public function storePolicy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'priority'         => 'required|in:low,medium,high,urgent',
            'response_hours'   => 'required|numeric|min:0',
            'resolution_hours' => 'required|numeric|min:0',
        ]);

        HelpdeskSlaPolicy::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return back()->with('success', 'SLA policy created.');
    }

    public function updatePolicy(Request $request, HelpdeskSlaPolicy $policy): RedirectResponse
    {
        $validated = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'response_hours'   => 'sometimes|numeric|min:0',
            'resolution_hours' => 'sometimes|numeric|min:0',
            'is_active'        => 'sometimes|boolean',
        ]);

        $policy->update($validated);

        return back()->with('success', 'SLA policy updated.');
    }

    public function escalations(Request $request): Response
    {
        $escalations = TicketEscalation::with(['ticket', 'escalatedTo'])
            ->when(!$request->boolean('show_resolved'), fn ($q) => $q->whereNull('resolved_at'))
            ->orderByDesc('escalated_at')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Helpdesk/Sla/Escalations', [
            'escalations'   => $escalations,
            'show_resolved' => $request->boolean('show_resolved'),
        ]);
    }

    public function checkBreaches(): RedirectResponse
    {
        $now = now();

        $breachedTickets = HelpdeskTicket::whereNotNull('sla_deadline')
            ->where('sla_deadline', '<', $now)
            ->whereNotIn('status', ['resolved', 'closed'])
            ->get();

        $created = 0;
        foreach ($breachedTickets as $ticket) {
            $alreadyEscalated = TicketEscalation::where('ticket_id', $ticket->id)
                ->where('escalation_type', 'resolution_breach')
                ->exists();

            if (!$alreadyEscalated) {
                TicketEscalation::create([
                    'tenant_id'       => $ticket->tenant_id,
                    'ticket_id'       => $ticket->id,
                    'escalation_type' => 'resolution_breach',
                    'escalated_at'    => $now,
                ]);
                $created++;
            }
        }

        return back()->with('success', "SLA check complete. {$created} new escalations created.");
    }

    public function escalate(Request $request, HelpdeskTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'escalation_type' => 'required|in:response_breach,resolution_breach',
            'escalated_to_id' => 'nullable|exists:users,id',
            'notes'           => 'nullable|string',
        ]);

        TicketEscalation::create([
            ...$validated,
            'tenant_id'    => auth()->user()->tenant_id,
            'ticket_id'    => $ticket->id,
            'escalated_at' => now(),
        ]);

        return back()->with('success', 'Ticket escalated.');
    }

    public function resolveEscalation(Request $request, TicketEscalation $escalation): RedirectResponse
    {
        $escalation->resolve($request->input('notes', ''));

        return back()->with('success', 'Escalation resolved.');
    }
}

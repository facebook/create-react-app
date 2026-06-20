<?php

namespace App\Modules\Helpdesk\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Helpdesk\Models\HelpdeskSlaPolicy;
use App\Modules\Helpdesk\Models\HelpdeskTeam;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HelpdeskTicketController extends Controller
{
    public function index(Request $request): Response
    {
        $tickets = HelpdeskTicket::with(['team', 'assignee'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->priority, fn ($q) => $q->where('priority', $request->priority))
            ->when($request->team_id, fn ($q) => $q->where('team_id', $request->team_id))
            ->when($request->assigned_to, fn ($q) => $q->where('assigned_to', $request->assigned_to))
            ->when($request->search, fn ($q) => $q->where(function ($q2) use ($request) {
                $q2->where('subject', 'like', "%{$request->search}%")
                   ->orWhere('customer_name', 'like', "%{$request->search}%");
            }))
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Helpdesk/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => $request->only(['status', 'priority', 'team_id', 'assigned_to', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Helpdesk/Tickets/Create', [
            'teams' => HelpdeskTeam::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject'        => 'required|string|max:255',
            'description'    => 'nullable|string',
            'type'           => 'required|in:question,issue,feature_request,other',
            'priority'       => 'required|in:low,medium,high,urgent',
            'team_id'        => 'nullable|exists:helpdesk_teams,id',
            'assigned_to'    => 'nullable|exists:users,id',
            'customer_name'  => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
        ]);

        $ticket = HelpdeskTicket::create([
            ...$validated,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
            'status'     => 'open',
        ]);

        $ticket->ticket_number = $ticket->generateTicketNumber();
        $ticket->saveQuietly();

        // Set SLA deadline
        $slaPolicy = HelpdeskSlaPolicy::where('priority', $ticket->priority)
            ->where('is_active', true)
            ->first();

        if ($slaPolicy) {
            $ticket->sla_deadline = now()->addHours($slaPolicy->resolution_hours);
            $ticket->saveQuietly();
        }

        return redirect()->route('helpdesk.tickets.show', $ticket)->with('success', 'Ticket created.');
    }

    public function show(HelpdeskTicket $ticket): Response
    {
        $ticket->load(['team', 'assignee', 'messages.author']);

        return Inertia::render('Helpdesk/Tickets/Show', [
            'ticket' => $ticket,
            'teams'  => HelpdeskTeam::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'users'  => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function edit(HelpdeskTicket $ticket): Response
    {
        return Inertia::render('Helpdesk/Tickets/Edit', [
            'ticket' => $ticket,
            'teams'  => HelpdeskTeam::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'users'  => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, HelpdeskTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'subject'        => 'required|string|max:255',
            'description'    => 'nullable|string',
            'type'           => 'required|in:question,issue,feature_request,other',
            'priority'       => 'required|in:low,medium,high,urgent',
            'status'         => 'required|in:open,in_progress,pending,resolved,closed',
            'team_id'        => 'nullable|exists:helpdesk_teams,id',
            'assigned_to'    => 'nullable|exists:users,id',
            'customer_name'  => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
        ]);

        $ticket->update($validated);

        return redirect()->route('helpdesk.tickets.show', $ticket)->with('success', 'Ticket updated.');
    }

    public function destroy(HelpdeskTicket $ticket): RedirectResponse
    {
        $ticket->delete();

        return redirect()->route('helpdesk.tickets.index')->with('success', 'Ticket deleted.');
    }

    public function resolve(HelpdeskTicket $ticket): RedirectResponse
    {
        $ticket->resolve();

        return redirect()->back()->with('success', 'Ticket resolved.');
    }

    public function close(HelpdeskTicket $ticket): RedirectResponse
    {
        $ticket->close();

        return redirect()->back()->with('success', 'Ticket closed.');
    }

    public function reopen(HelpdeskTicket $ticket): RedirectResponse
    {
        $ticket->reopen();

        return redirect()->back()->with('success', 'Ticket reopened.');
    }

    public function reply(Request $request, HelpdeskTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'body'        => 'required|string',
            'is_internal' => 'boolean',
        ]);

        $ticket->messages()->create([
            'body'        => $validated['body'],
            'is_internal' => $validated['is_internal'] ?? false,
            'author_id'   => auth()->id(),
        ]);

        $ticket->recordFirstResponse();

        return redirect()->back()->with('success', 'Reply sent.');
    }
}

<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\SupportTicket;
use App\Modules\Finance\Models\TicketComment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SupportTicket::class);

        $query = SupportTicket::with(['assignedTo', 'createdBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $tickets = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Finance/SupportTickets/Index', [
            'tickets' => $tickets,
            'filters' => $request->only('status', 'priority'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SupportTicket::class);

        $contacts = Contact::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Finance/SupportTickets/Create', [
            'contacts' => $contacts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', SupportTicket::class);

        $data = $request->validate([
            'subject'    => ['required', 'string'],
            'description'=> ['required', 'string'],
            'priority'   => ['nullable', 'in:low,normal,high,urgent'],
            'category'   => ['nullable', 'string'],
            'contact_id' => ['nullable', 'exists:contacts,id'],
        ]);

        $tenantId = app('tenant')->id;

        $data['tenant_id']  = $tenantId;
        $data['reference']  = SupportTicket::generateReference($tenantId);
        $data['created_by'] = auth()->id();
        $data['priority']   = $data['priority'] ?? 'normal';

        $ticket = SupportTicket::create($data);

        return redirect()->route('finance.support-tickets.show', $ticket);
    }

    public function show(SupportTicket $supportTicket): Response
    {
        $this->authorize('view', $supportTicket);

        $supportTicket->load(['comments.createdBy', 'assignedTo', 'createdBy', 'contact']);

        return Inertia::render('Finance/SupportTickets/Show', [
            'ticket' => $supportTicket,
        ]);
    }

    public function destroy(SupportTicket $supportTicket): RedirectResponse
    {
        $this->authorize('delete', $supportTicket);

        $supportTicket->delete();

        return redirect()->route('finance.support-tickets.index');
    }

    public function resolve(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        $this->authorize('update', $supportTicket);

        $supportTicket->resolve();

        return back()->with('success', 'Ticket resolved.');
    }

    public function close(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        $this->authorize('update', $supportTicket);

        $supportTicket->close();

        return back()->with('success', 'Ticket closed.');
    }

    public function reopen(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        $this->authorize('update', $supportTicket);

        $supportTicket->reopen();

        return back()->with('success', 'Ticket reopened.');
    }

    public function assign(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        $this->authorize('update', $supportTicket);

        $data = $request->validate([
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
        ]);

        $supportTicket->assign($data['assigned_to']);

        return back()->with('success', 'Ticket assigned.');
    }

    public function addComment(Request $request, SupportTicket $supportTicket): RedirectResponse
    {
        $this->authorize('view', $supportTicket);

        $data = $request->validate([
            'body'        => ['required', 'string'],
            'is_internal' => ['nullable', 'boolean'],
        ]);

        TicketComment::create([
            'tenant_id'         => app('tenant')->id,
            'support_ticket_id' => $supportTicket->id,
            'created_by'        => auth()->id(),
            'body'              => $data['body'],
            'is_internal'       => $data['is_internal'] ?? false,
        ]);

        return back()->with('success', 'Comment added.');
    }
}

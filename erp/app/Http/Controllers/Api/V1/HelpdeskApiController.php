<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Helpdesk\Models\HelpdeskTicket;
use App\Modules\Helpdesk\Models\HelpdeskMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HelpdeskApiController extends ApiController
{
    /**
     * GET /api/v1/helpdesk/tickets
     */
    public function index(Request $request): JsonResponse
    {
        $query = HelpdeskTicket::with(['assignee:id,name']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($priority = $request->query('priority')) {
            $query->where('priority', $priority);
        }

        if ($assignedTo = $request->query('assigned_to')) {
            $query->where('assigned_to', $assignedTo);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/helpdesk/tickets/{id}
     */
    public function show(int $id): JsonResponse
    {
        $ticket = HelpdeskTicket::with(['messages.author:id,name', 'assignee:id,name'])->findOrFail($id);

        return $this->success($ticket);
    }

    /**
     * POST /api/v1/helpdesk/tickets
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject'        => 'required|string|max:255',
            'description'    => 'nullable|string',
            'type'           => 'nullable|string',
            'priority'       => 'nullable|string|in:low,medium,high,urgent',
            'team_id'        => 'nullable|integer|exists:helpdesk_teams,id',
            'assigned_to'    => 'nullable|integer|exists:users,id',
            'customer_name'  => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['created_by'] = $request->user()->id;
        $validated['status']    = 'open';

        $ticket = HelpdeskTicket::create($validated);
        $ticket->ticket_number = $ticket->generateTicketNumber();
        $ticket->save();

        return $this->success($ticket, 201);
    }

    /**
     * PUT /api/v1/helpdesk/tickets/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $ticket = HelpdeskTicket::findOrFail($id);

        $validated = $request->validate([
            'subject'        => 'sometimes|string|max:255',
            'description'    => 'nullable|string',
            'type'           => 'nullable|string',
            'priority'       => 'nullable|string|in:low,medium,high,urgent',
            'status'         => 'nullable|string',
            'team_id'        => 'nullable|integer|exists:helpdesk_teams,id',
            'assigned_to'    => 'nullable|integer|exists:users,id',
        ]);

        $ticket->update($validated);

        return $this->success($ticket);
    }

    /**
     * DELETE /api/v1/helpdesk/tickets/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $ticket = HelpdeskTicket::findOrFail($id);
        $ticket->delete();

        return $this->success(['message' => 'Ticket deleted']);
    }

    /**
     * POST /api/v1/helpdesk/tickets/{ticket}/reply
     */
    public function reply(Request $request, int $ticket): JsonResponse
    {
        $helpdeskTicket = HelpdeskTicket::findOrFail($ticket);

        $validated = $request->validate([
            'body'        => 'required|string',
            'is_internal' => 'nullable|boolean',
        ]);

        $message = $helpdeskTicket->messages()->create([
            'body'        => $validated['body'],
            'is_internal' => $validated['is_internal'] ?? false,
            'author_id'   => $request->user()->id,
        ]);

        // Mark first response time
        if (is_null($helpdeskTicket->first_response_at)) {
            $helpdeskTicket->first_response_at = now();
            $helpdeskTicket->save();
        }

        return $this->success($message, 201);
    }

    /**
     * POST /api/v1/helpdesk/tickets/{ticket}/resolve
     */
    public function resolve(int $ticket): JsonResponse
    {
        $helpdeskTicket = HelpdeskTicket::findOrFail($ticket);
        $helpdeskTicket->resolve();

        return $this->success($helpdeskTicket);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Helpdesk\Models\HelpdeskSlaPolicy;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SlaApiController extends ApiController
{
    // ── SLA Policies ─────────────────────────────────────────────────────────

    public function indexPolicies(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $policies = HelpdeskSlaPolicy::where('tenant_id', $tenantId)
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('priority')
            ->get();

        return $this->success($policies);
    }

    public function storePolicy(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'             => ['required', 'string', 'max:100'],
            'priority'         => ['required', 'string', 'in:low,medium,high,urgent'],
            'response_hours'   => ['required', 'integer', 'min:1'],
            'resolution_hours' => ['required', 'integer', 'min:1'],
        ]);

        $policy = HelpdeskSlaPolicy::create([
            ...$data,
            'tenant_id' => $tenantId,
            'is_active' => true,
        ]);

        return $this->success($policy, 201);
    }

    public function updatePolicy(Request $request, HelpdeskSlaPolicy $slaPolicy): JsonResponse
    {
        $data = $request->validate([
            'name'             => ['sometimes', 'string', 'max:100'],
            'response_hours'   => ['sometimes', 'integer', 'min:1'],
            'resolution_hours' => ['sometimes', 'integer', 'min:1'],
            'is_active'        => ['boolean'],
        ]);

        $slaPolicy->update($data);

        return $this->success($slaPolicy->fresh());
    }

    public function destroyPolicy(HelpdeskSlaPolicy $slaPolicy): JsonResponse
    {
        $slaPolicy->delete();
        return $this->success(['message' => 'SLA policy deleted.']);
    }

    // ── SLA Dashboard / Metrics ───────────────────────────────────────────────

    public function dashboard(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $open    = HelpdeskTicket::where('tenant_id', $tenantId)->whereIn('status', ['open', 'pending'])->get();
        $breached = $open->filter(fn ($t) => $t->is_overdue);

        $byPriority = $open->groupBy('priority')->map(fn ($group) => [
            'total'   => $group->count(),
            'breached' => $group->filter(fn ($t) => $t->is_overdue)->count(),
        ]);

        $overdue = $open->filter(fn ($t) => $t->sla_deadline !== null && now()->gt($t->sla_deadline))
            ->sortBy('sla_deadline')
            ->take(10)
            ->map(fn ($t) => [
                'id'           => $t->id,
                'subject'      => $t->subject,
                'priority'     => $t->priority,
                'sla_deadline' => $t->sla_deadline?->toDateTimeString(),
                'overdue_by'   => (int) now()->diffInMinutes($t->sla_deadline),
            ])
            ->values();

        return $this->success([
            'open_tickets'    => $open->count(),
            'breached_count'  => $breached->count(),
            'breach_rate'     => $open->count() > 0 ? round($breached->count() / $open->count() * 100, 1) : 0,
            'by_priority'     => $byPriority,
            'overdue_tickets' => $overdue,
        ]);
    }

    public function atRisk(Request $request): JsonResponse
    {
        $tenantId     = $this->tenantId($request);
        $minutesAhead = (int) $request->get('within_minutes', 120);

        $deadline = now()->addMinutes($minutesAhead);

        $tickets = HelpdeskTicket::where('tenant_id', $tenantId)
            ->whereIn('status', ['open', 'pending'])
            ->where('sla_deadline', '>', now())
            ->where('sla_deadline', '<=', $deadline)
            ->orderBy('sla_deadline')
            ->get(['id', 'subject', 'priority', 'status', 'sla_deadline']);

        return $this->success([
            'within_minutes' => $minutesAhead,
            'count'          => $tickets->count(),
            'tickets'        => $tickets->map(fn ($t) => [
                'id'               => $t->id,
                'subject'          => $t->subject,
                'priority'         => $t->priority,
                'status'           => $t->status,
                'sla_deadline'     => $t->sla_deadline?->toDateTimeString(),
                'minutes_remaining' => (int) now()->diffInMinutes($t->sla_deadline, false),
            ]),
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

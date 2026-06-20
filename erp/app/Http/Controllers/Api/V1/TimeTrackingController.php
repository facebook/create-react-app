<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\PM\Models\Project;
use App\Modules\PM\Models\Task;
use App\Modules\PM\Models\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeTrackingController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $entries = TimeEntry::where('tenant_id', $tenantId)
            ->when($request->user_id, fn ($q) => $q->where('user_id', $request->user_id))
            ->when($request->from, fn ($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to, fn ($q) => $q->whereDate('date', '<=', $request->to))
            ->when($request->is_billable !== null, fn ($q) => $q->where('is_billable', $request->boolean('is_billable')))
            ->with(['user:id,name', 'task:id,name,project_id'])
            ->orderByDesc('date')
            ->paginate(25);

        return $this->paginated($entries);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'task_id'     => ['required', 'exists:tasks,id'],
            'hours'       => ['required', 'numeric', 'min:0.1', 'max:24'],
            'date'        => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_billable' => ['sometimes', 'boolean'],
        ]);

        $entry = TimeEntry::create([
            ...$data,
            'tenant_id'  => $tenantId,
            'user_id'    => $request->user()->id,
            'created_by' => $request->user()->id,
        ]);

        return $this->success($entry->load('task:id,name,project_id'), 201);
    }

    public function update(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        $data = $request->validate([
            'hours'       => ['sometimes', 'numeric', 'min:0.1', 'max:24'],
            'date'        => ['sometimes', 'date'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_billable' => ['sometimes', 'boolean'],
        ]);

        $timeEntry->update($data);
        return $this->success($timeEntry->fresh());
    }

    public function destroy(TimeEntry $timeEntry): JsonResponse
    {
        $timeEntry->delete();
        return $this->success(['message' => 'Time entry deleted.']);
    }

    public function projectSummary(Request $request, Project $project): JsonResponse
    {
        $from     = $request->get('from', now()->startOfMonth()->toDateString());
        $to       = $request->get('to', now()->toDateString());

        $entries = $project->timeEntries()
            ->whereDate('date', '>=', $from)
            ->whereDate('date', '<=', $to)
            ->with('user:id,name')
            ->get();

        $totalHours    = $entries->sum('hours');
        $billableHours = $entries->where('is_billable', true)->sum('hours');

        $byUser = $entries->groupBy('user_id')->map(fn ($group) => [
            'user_id'        => $group->first()->user_id,
            'name'           => $group->first()->user?->name ?? 'Unknown',
            'total_hours'    => round($group->sum('hours'), 2),
            'billable_hours' => round($group->where('is_billable', true)->sum('hours'), 2),
        ])->values();

        return $this->success([
            'project_id'      => $project->id,
            'project_name'    => $project->name,
            'period'          => ['from' => $from, 'to' => $to],
            'total_hours'     => round($totalHours, 2),
            'billable_hours'  => round($billableHours, 2),
            'non_billable'    => round($totalHours - $billableHours, 2),
            'entries_count'   => $entries->count(),
            'by_user'         => $byUser,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}

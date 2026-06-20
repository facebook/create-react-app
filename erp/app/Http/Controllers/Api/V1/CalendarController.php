<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use App\Modules\Appointments\Models\Appointment;
use App\Modules\Appointments\Models\AppointmentSlot;
use App\Modules\Events\Models\Event;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\PM\Models\Task;
use App\Modules\Finance\Models\Invoice;

class CalendarController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $from     = Carbon::parse($request->input('from', now()->startOfMonth()));
        $to       = Carbon::parse($request->input('to', now()->endOfMonth()));
        $types    = $request->input('types', ['tasks', 'leaves', 'events', 'invoices']);

        $events = collect();

        if (in_array('tasks', $types)) {
            $events = $events->merge($this->getTasks($tenantId, $from, $to));
        }
        if (in_array('leaves', $types)) {
            $events = $events->merge($this->getLeaves($tenantId, $from, $to));
        }
        if (in_array('events', $types)) {
            $events = $events->merge($this->getEvents($tenantId, $from, $to));
        }
        if (in_array('invoices', $types)) {
            $events = $events->merge($this->getInvoiceDueDates($tenantId, $from, $to));
        }

        $sorted = $events->sortBy('start')->values();

        return $this->success([
            'from'   => $from->toDateString(),
            'to'     => $to->toDateString(),
            'total'  => $sorted->count(),
            'events' => $sorted,
        ]);
    }

    private function getTasks(int $tenantId, Carbon $from, Carbon $to): Collection
    {
        return Task::where('tenant_id', $tenantId)
            ->where(function ($q) use ($from, $to) {
                $q->whereBetween('due_date', [$from, $to])
                  ->orWhereBetween('start_date', [$from, $to]);
            })
            ->get()
            ->map(fn ($task) => [
                'id'          => "task-{$task->id}",
                'type'        => 'task',
                'title'       => $task->title,
                'start'       => $task->start_date?->toDateString() ?? $task->due_date?->toDateString(),
                'end'         => $task->due_date?->toDateString(),
                'color'       => $this->taskColor($task->status),
                'status'      => $task->status,
                'priority'    => $task->priority,
                'source_id'   => $task->id,
                'source_url'  => "/pm/tasks/{$task->id}",
            ]);
    }

    private function getLeaves(int $tenantId, Carbon $from, Carbon $to): Collection
    {
        return LeaveRequest::where('tenant_id', $tenantId)
            ->whereIn('status', ['approved', 'pending'])
            ->where(function ($q) use ($from, $to) {
                $q->whereBetween('start_date', [$from, $to])
                  ->orWhereBetween('end_date', [$from, $to]);
            })
            ->with('employee:id,first_name,last_name')
            ->get()
            ->map(fn ($leave) => [
                'id'         => "leave-{$leave->id}",
                'type'       => 'leave',
                'title'      => ($leave->employee ? "{$leave->employee->first_name} {$leave->employee->last_name}" : 'Employee') . ' – Leave',
                'start'      => $leave->start_date?->toDateString(),
                'end'        => $leave->end_date?->toDateString(),
                'color'      => $leave->status === 'approved' ? '#f59e0b' : '#6b7280',
                'status'     => $leave->status,
                'source_id'  => $leave->id,
                'source_url' => "/hr/leaves/{$leave->id}",
            ]);
    }

    private function getEvents(int $tenantId, Carbon $from, Carbon $to): Collection
    {
        return Event::where('tenant_id', $tenantId)
            ->where(function ($q) use ($from, $to) {
                $q->whereBetween('starts_at', [$from, $to])
                  ->orWhereBetween('ends_at', [$from, $to]);
            })
            ->get()
            ->map(fn ($event) => [
                'id'         => "event-{$event->id}",
                'type'       => 'event',
                'title'      => $event->title,
                'start'      => $event->starts_at?->toIso8601String(),
                'end'        => $event->ends_at?->toIso8601String(),
                'color'      => '#6366f1',
                'source_id'  => $event->id,
                'source_url' => "/events/{$event->id}",
            ]);
    }

    private function getInvoiceDueDates(int $tenantId, Carbon $from, Carbon $to): Collection
    {
        return Invoice::where('tenant_id', $tenantId)
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->whereBetween('due_date', [$from, $to])
            ->with('contact:id,name')
            ->get()
            ->map(fn ($inv) => [
                'id'         => "invoice-{$inv->id}",
                'type'       => 'invoice_due',
                'title'      => "Invoice {$inv->number} due",
                'start'      => $inv->due_date?->toDateString(),
                'end'        => $inv->due_date?->toDateString(),
                'color'      => '#dc2626',
                'status'     => $inv->status,
                'amount'     => $inv->total,
                'source_id'  => $inv->id,
                'source_url' => "/finance/invoices/{$inv->id}",
            ]);
    }

    private function taskColor(string $status): string
    {
        return match ($status) {
            'done', 'completed' => '#16a34a',
            'in_progress'       => '#2563eb',
            'review'            => '#9333ea',
            default             => '#6b7280',
        };
    }
}

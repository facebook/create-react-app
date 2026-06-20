<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Core\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityFeedController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = AuditLog::where('tenant_id', $tenantId)
            ->with('user:id,name')
            ->latest('created_at');

        // Filter by action/event
        if ($action = $request->action) {
            $query->where(function ($q) use ($action) {
                $q->where('action', $action)->orWhere('event', $action);
            });
        }

        // Filter by module/model type
        if ($module = $request->module) {
            $query->where('auditable_type', 'like', "%{$module}%");
        }

        // Filter by user
        if ($userId = $request->user_id) {
            $query->where('user_id', $userId);
        }

        // Filter by date range
        if ($from = $request->from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to = $request->to) {
            $query->where('created_at', '<=', $to);
        }

        $logs = $query->paginate($request->integer('per_page', 20));

        // Enrich each log with human-readable info
        $logs->getCollection()->transform(function (AuditLog $log) {
            return [
                'id'              => $log->id,
                'action'          => $log->action ?? $log->event,
                'model_type'      => $log->auditable_type ? class_basename($log->auditable_type) : null,
                'model_id'        => $log->auditable_id,
                'model_label'     => $log->auditable_label,
                'description'     => $this->buildDescription($log),
                'old_values'      => $log->old_values,
                'new_values'      => $log->new_values,
                'changed_fields'  => $this->extractChangedFields($log),
                'performed_by'    => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name] : null,
                'ip_address'      => $log->ip_address,
                'created_at'      => $log->created_at,
            ];
        });

        return $this->paginated($logs);
    }

    public function stats(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $actionCounts = AuditLog::where('tenant_id', $tenantId)
            ->selectRaw('COALESCE(action, event) as act, COUNT(*) as count')
            ->groupBy('act')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($r) => ['action' => $r->act, 'count' => $r->count]);

        $activeUsers = AuditLog::where('tenant_id', $tenantId)
            ->whereNotNull('user_id')
            ->selectRaw('user_id, COUNT(*) as count')
            ->groupBy('user_id')
            ->orderByDesc('count')
            ->with('user:id,name')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'user_id' => $r->user_id,
                'name'    => $r->user?->name ?? 'Unknown',
                'count'   => $r->count,
            ]);

        $recentActivity = AuditLog::where('tenant_id', $tenantId)
            ->whereRaw("created_at >= datetime('now', '-7 days')")
            ->count();

        return $this->success([
            'total_events'    => AuditLog::where('tenant_id', $tenantId)->count(),
            'recent_7_days'   => $recentActivity,
            'by_action'       => $actionCounts,
            'most_active_users' => $activeUsers,
        ]);
    }

    private function buildDescription(AuditLog $log): string
    {
        $action    = $log->action ?? $log->event ?? 'acted on';
        $modelType = $log->auditable_type ? class_basename($log->auditable_type) : 'record';
        $label     = $log->auditable_label ?? "#{$log->auditable_id}";
        $user      = $log->user?->name ?? 'System';

        return "{$user} {$action} {$modelType} {$label}";
    }

    private function extractChangedFields(AuditLog $log): array
    {
        if (! $log->old_values || ! $log->new_values) {
            return [];
        }

        return array_keys(array_diff_assoc(
            (array) $log->new_values,
            (array) $log->old_values
        ));
    }
}

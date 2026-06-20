<?php

namespace App\Http\Controllers;

use App\Modules\Core\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        // Only admin/super-admin can view audit logs
        if (! $request->user()->hasAnyRole(['super-admin', 'admin'])) {
            abort(403);
        }

        $tenantId = $request->user()->tenant_id;

        $query = AuditLog::where('tenant_id', $tenantId)
            ->with('user')
            ->orderByDesc('created_at');

        // Optional filters
        if ($event = $request->query('event')) {
            $query->where('event', $event);
        }
        if ($model = $request->query('model')) {
            $query->where('auditable_type', 'like', "%{$model}%");
        }

        $logs = $query->paginate(50)->withQueryString()->through(fn ($log) => [
            'id'           => $log->id,
            'event'        => $log->event,
            'model_name'   => class_basename($log->auditable_type),
            'auditable_id' => $log->auditable_id,
            'user_name'    => $log->user?->name ?? 'System',
            'old_values'   => $log->old_values,
            'new_values'   => $log->new_values,
            'ip_address'   => $log->ip_address,
            'created_at'   => $log->created_at?->toISOString(),
        ]);

        return Inertia::render('Settings/AuditLog', [
            'logs'         => $logs,
            'filter_event' => $request->query('event', ''),
            'filter_model' => $request->query('model', ''),
        ]);
    }
}

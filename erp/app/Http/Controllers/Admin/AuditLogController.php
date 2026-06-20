<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Core\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $query = AuditLog::with('user')
            ->where('audit_logs.tenant_id', auth()->user()->tenant_id)
            ->when($request->event,     fn ($q) => $q->where('event', $request->event))
            ->when($request->user_id,   fn ($q) => $q->where('user_id', $request->user_id))
            ->when($request->model,     fn ($q) => $q->where('auditable_type', 'like', "%{$request->model}%"))
            ->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to,   fn ($q) => $q->whereDate('created_at', '<=', $request->date_to));

        $logs = $query
            ->latest('created_at')
            ->paginate(50)
            ->withQueryString()
            ->through(fn ($log) => [
                'id'             => $log->id,
                'event'          => $log->event,
                'action'         => $log->action ?? $log->event,
                'model'          => class_basename($log->auditable_type),
                'model_id'       => $log->auditable_id,
                'auditable_label'=> $log->auditable_label,
                'user'           => $log->user ? ['name' => $log->user->name, 'email' => $log->user->email] : null,
                'user_name'      => $log->user?->name ?? 'System',
                'old_values'     => $log->old_values,
                'new_values'     => $log->new_values,
                'ip_address'     => $log->ip_address,
                'user_agent'     => $log->user_agent,
                'module'         => $log->module,
                'created_at'     => $log->created_at->diffForHumans(),
                'created_at_raw' => $log->created_at->toDateTimeString(),
            ]);

        $users = User::where('tenant_id', auth()->user()->tenant_id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/AuditLog/Index', [
            'logs'    => $logs,
            'filters' => $request->only(['event', 'model', 'user_id', 'date_from', 'date_to']),
            'users'   => $users,
        ]);
    }

    public function show(AuditLog $log): Response
    {
        $this->authorize('viewAny', User::class);
        $log->load('user');

        return Inertia::render('Admin/AuditLog/Show', [
            'log' => [
                'id'             => $log->id,
                'event'          => $log->event,
                'action'         => $log->action ?? $log->event,
                'auditable_type' => $log->auditable_type,
                'auditable_id'   => $log->auditable_id,
                'auditable_label'=> $log->auditable_label,
                'old_values'     => $log->old_values,
                'new_values'     => $log->new_values,
                'ip_address'     => $log->ip_address,
                'user_agent'     => $log->user_agent,
                'url'            => $log->url,
                'module'         => $log->module,
                'user'           => $log->user ? [
                    'id'    => $log->user->id,
                    'name'  => $log->user->name,
                    'email' => $log->user->email,
                ] : null,
                'created_at'     => $log->created_at->toDateTimeString(),
            ],
        ]);
    }
}

<?php

namespace App\Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AuditLog::class);

        $logs = AuditLog::with('user')
            ->when($request->action,  fn ($q) => $q->where('action', $request->action))
            ->when($request->module,  fn ($q) => $q->where('module', $request->module))
            ->when($request->user_id, fn ($q) => $q->where('user_id', $request->user_id))
            ->latest('created_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Core/AuditLogs/Index', [
            'logs'    => $logs,
            'filters' => $request->only(['action', 'module', 'user_id']),
        ]);
    }

    public function show(AuditLog $auditLog): Response
    {
        $this->authorize('view', $auditLog);
        $auditLog->load('user');
        return Inertia::render('Core/AuditLogs/Show', ['log' => $auditLog]);
    }
}

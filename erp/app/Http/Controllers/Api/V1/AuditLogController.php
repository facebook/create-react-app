<?php
namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Core\Models\AuditLog;

class AuditLogController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $logs = AuditLog::where('tenant_id', $tenantId)
            ->with('user:id,name')
            ->when($request->action, fn($q) => $q->where('action', $request->action))
            ->when($request->type, fn($q) => $q->where('auditable_type', 'like', "%{$request->type}%"))
            ->latest()
            ->paginate(50);

        return $this->paginated($logs);
    }
}

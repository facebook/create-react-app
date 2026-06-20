<?php
namespace App\Traits;

use App\Modules\Core\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            static::logActivity($model, 'created', [], $model->getAttributes());
        });

        static::updated(function ($model) {
            static::logActivity($model, 'updated', $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function ($model) {
            static::logActivity($model, 'deleted', $model->getAttributes(), []);
        });
    }

    protected static function logActivity($model, string $action, array $oldValues, array $newValues): void
    {
        $tenantId = $model->tenant_id ?? (app()->has('tenant') ? app('tenant')->id : null);
        if (!$tenantId) return;

        AuditLog::create([
            'tenant_id'      => $tenantId,
            'user_id'        => Auth::id(),
            'event'          => $action,
            'action'         => $action,
            'auditable_type' => get_class($model),
            'auditable_id'   => $model->id,
            'old_values'     => empty($oldValues) ? null : $oldValues,
            'new_values'     => empty($newValues) ? null : $newValues,
            'ip_address'     => Request::ip(),
            'user_agent'     => Request::userAgent(),
        ]);
    }
}

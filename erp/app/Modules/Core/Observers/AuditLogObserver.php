<?php

namespace App\Modules\Core\Observers;

use App\Modules\Core\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogObserver
{
    public function created(Model $model): void
    {
        $this->log('created', $model, [], $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $dirty = $model->getDirty();
        if (empty($dirty)) {
            return;
        }

        $old = array_intersect_key($model->getOriginal(), $dirty);
        $this->log('updated', $model, $old, $dirty);
    }

    public function deleted(Model $model): void
    {
        $this->log('deleted', $model, $model->getOriginal(), []);
    }

    private function log(string $action, Model $model, array $old, array $new): void
    {
        $tenantId = $this->resolveTenantId($model);

        AuditLog::create([
            'user_id'        => Auth::id(),
            'tenant_id'      => $tenantId,
            'event'          => $action,
            'action'         => $action,
            'auditable_type' => get_class($model),
            'auditable_id'   => $model->getKey(),
            'old_values'     => $old ?: null,
            'new_values'     => $new ?: null,
            'ip_address'     => Request::ip(),
            'user_agent'     => Request::userAgent(),
        ]);
    }

    private function resolveTenantId(Model $model): ?int
    {
        if (isset($model->tenant_id)) {
            return $model->tenant_id;
        }

        try {
            /** @var \App\Modules\Core\Models\Tenant|null $tenant */
            $tenant = app()->has('tenant') ? app('tenant') : null;

            return $tenant?->id;
        } catch (\Throwable) {
            return null;
        }
    }
}

<?php

namespace App\Modules\Core\Traits;

use App\Modules\Core\Models\AuditLog;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            AuditLog::record(
                'created',
                $model,
                [],
                $model->getDirty(),
                $model->tenant_id ?? null
            );
        });

        static::updated(function ($model) {
            $dirty = $model->getDirty();
            if (empty($dirty)) {
                return;
            }
            AuditLog::record(
                'updated',
                $model,
                $model->getOriginal(),
                $dirty,
                $model->tenant_id ?? null
            );
        });

        static::deleted(function ($model) {
            AuditLog::record(
                'deleted',
                $model,
                $model->toArray(),
                [],
                $model->tenant_id ?? null
            );
        });
    }
}

<?php

namespace App\Modules\Core\Traits;

use App\Modules\Core\Observers\AuditLogObserver;

trait HasAuditLog
{
    public static function bootHasAuditLog(): void
    {
        $observer = fn () => app(AuditLogObserver::class);

        static::created(fn ($model) => $observer()->created($model));
        static::updated(fn ($model) => $observer()->updated($model));
        static::deleted(fn ($model) => $observer()->deleted($model));
    }
}

<?php

namespace App\Modules\Core\Traits;

use App\Modules\Core\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (app()->has('tenant')) {
                /** @var Tenant $tenant */
                $tenant = app('tenant');
                $query->where((new static())->getTable() . '.tenant_id', $tenant->id);
            }
        });

        static::creating(function ($model) {
            if (app()->has('tenant') && empty($model->tenant_id)) {
                $model->tenant_id = app('tenant')->id;
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}

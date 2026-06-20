<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    public const UPDATED_AT = null;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'tenant_id',
        'event',
        'action',
        'auditable_type',
        'auditable_id',
        'auditable_label',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'url',
        'module',
        'created_at',
    ];

    protected $casts = [
        'old_values'  => 'array',
        'new_values'  => 'array',
        'created_at'  => 'datetime',
    ];

    protected $dates = ['created_at'];

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Record an audit log entry.
     *
     * Supports two call styles:
     *   record(string $action, $model, array $old, array $new, string $module)   -- new style
     *   record(string $event,  $model, array $old, array $new, int    $tenantId) -- legacy style
     *
     * @param  string            $action
     * @param  Model|null        $model
     * @param  array             $oldValues
     * @param  array             $newValues
     * @param  string|int|null   $moduleOrTenantId
     * @return static
     */
    public static function record(
        string $action,
        $model = null,
        array $oldValues = [],
        array $newValues = [],
        $moduleOrTenantId = null
    ): static {
        $tenantId = null;
        $module   = '';

        if (is_int($moduleOrTenantId)) {
            $tenantId = $moduleOrTenantId;
        } elseif (is_string($moduleOrTenantId)) {
            $module = $moduleOrTenantId;
        }

        if ($tenantId === null) {
            $tenantId = auth()->user()?->tenant_id ?? 0;
        }

        return static::create([
            'tenant_id'       => $tenantId,
            'user_id'         => auth()->id(),
            'event'           => $action,
            'action'          => $action,
            'auditable_type'  => $model ? get_class($model) : null,
            'auditable_id'    => $model?->getKey(),
            'auditable_label' => $model?->name ?? $model?->title ?? $model?->subject ?? null,
            'old_values'      => $oldValues ?: null,
            'new_values'      => $newValues ?: null,
            'ip_address'      => request()?->ip(),
            'user_agent'      => request()?->userAgent(),
            'url'             => request()?->fullUrl(),
            'module'          => $module,
            'created_at'      => now(),
        ]);
    }

    /**
     * Get a human-readable summary of changes.
     */
    public function getChangeSummaryAttribute(): string
    {
        if ($this->old_values && $this->new_values) {
            $changedKeys = array_keys(array_diff_assoc(
                (array) $this->new_values,
                (array) $this->old_values
            ));

            if (empty($changedKeys)) {
                $changedKeys = array_keys((array) $this->new_values);
            }

            return implode(', ', $changedKeys) . ' changed';
        }

        return $this->action ?? $this->event ?? '';
    }
}

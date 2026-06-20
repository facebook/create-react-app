<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantSetting extends Model
{
    protected $fillable = ['tenant_id', 'key', 'value'];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public static function getValue(int $tenantId, string $key, mixed $default = null): mixed
    {
        return static::where('tenant_id', $tenantId)->where('key', $key)->value('value') ?? $default;
    }

    public static function setValue(int $tenantId, string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['tenant_id' => $tenantId, 'key' => $key],
            ['value'     => $value]
        );
    }
}

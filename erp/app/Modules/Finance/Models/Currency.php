<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'symbol',
        'decimal_places',
        'is_base',
        'is_active',
    ];

    protected $casts = [
        'is_base'   => 'boolean',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeBase($query)
    {
        return $query->where('is_base', true);
    }

    public function setAsBase(): void
    {
        static::where('tenant_id', $this->tenant_id)->update(['is_base' => false]);
        $this->is_base = true;
        $this->save();
    }

    public static function getBase(int $tenantId): ?self
    {
        return static::where('tenant_id', $tenantId)->where('is_base', true)->first();
    }
}

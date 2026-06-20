<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitOfMeasure extends Model
{
    use BelongsToTenant;
    use HasAuditLog;

    protected $table = 'units_of_measure';

    protected $fillable = [
        'tenant_id',
        'name',
        'abbreviation',
        'type',
        'is_base',
        'conversion_factor',
        'is_active',
    ];

    protected $casts = [
        'is_base'           => 'boolean',
        'is_active'         => 'boolean',
        'conversion_factor' => 'float',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'uom_id');
    }

    public function convertTo(float $quantity, self $target): float
    {
        if ($target->conversion_factor == 0) {
            return 0.0;
        }

        return ($quantity * $this->conversion_factor) / $target->conversion_factor;
    }

    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} ({$this->abbreviation})";
    }
}

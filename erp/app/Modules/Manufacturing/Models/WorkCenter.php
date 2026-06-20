<?php

namespace App\Modules\Manufacturing\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkCenter extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'work_centers';

    protected $fillable = [
        'tenant_id', 'name', 'code', 'capacity',
        'efficiency_factor', 'time_efficiency', 'hourly_cost',
        'is_active', 'description',
    ];

    protected $casts = [
        'capacity'          => 'float',
        'efficiency_factor' => 'float',
        'time_efficiency'   => 'float',
        'hourly_cost'       => 'float',
        'is_active'         => 'boolean',
    ];

    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class);
    }

    protected function effectiveHourlyCost(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->hourly_cost * ($this->efficiency_factor / 100)
        );
    }
}

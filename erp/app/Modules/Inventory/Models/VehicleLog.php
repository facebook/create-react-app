<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleLog extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'vehicle_id', 'log_type', 'log_date',
        'odometer_start', 'odometer_end', 'distance_km',
        'fuel_litres', 'cost', 'driver_name', 'destination', 'purpose', 'notes',
    ];

    protected $casts = [
        'log_date'       => 'date',
        'odometer_start' => 'float',
        'odometer_end'   => 'float',
        'distance_km'    => 'float',
        'fuel_litres'    => 'float',
        'cost'           => 'float',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function getFuelEfficiencyAttribute(): ?float
    {
        if ($this->fuel_litres > 0 && $this->distance_km > 0) {
            return round($this->distance_km / $this->fuel_litres, 2);
        }

        return null;
    }
}

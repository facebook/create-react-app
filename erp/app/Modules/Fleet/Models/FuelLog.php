<?php

namespace App\Modules\Fleet\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelLog extends Model
{
    use BelongsToTenant;

    protected $table = 'fleet_fuel_logs';

    protected $fillable = [
        'tenant_id',
        'vehicle_id',
        'log_date',
        'odometer_km',
        'liters',
        'cost_per_liter',
        'total_cost',
        'fuel_type',
        'station',
        'driver_id',
        'notes',
    ];

    protected $casts = [
        'log_date'      => 'date',
        'liters'        => 'float',
        'cost_per_liter' => 'float',
        'total_cost'    => 'float',
        'odometer_km'   => 'float',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}

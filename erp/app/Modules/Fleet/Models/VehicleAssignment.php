<?php

namespace App\Modules\Fleet\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleAssignment extends Model
{
    use BelongsToTenant;

    protected $table = 'fleet_vehicle_assignments';

    protected $fillable = [
        'tenant_id',
        'vehicle_id',
        'driver_id',
        'purpose',
        'assigned_at',
        'returned_at',
        'start_odometer',
        'end_odometer',
        'notes',
    ];

    protected $casts = [
        'assigned_at'    => 'datetime',
        'returned_at'    => 'datetime',
        'start_odometer' => 'float',
        'end_odometer'   => 'float',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function return(float $endOdometer = null): void
    {
        $this->returned_at  = now();
        $this->end_odometer = $endOdometer;
        $this->save();

        if ($endOdometer !== null) {
            $this->vehicle()->update(['odometer_km' => $endOdometer]);
        }
    }
}

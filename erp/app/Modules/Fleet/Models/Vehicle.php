<?php

namespace App\Modules\Fleet\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use BelongsToTenant;

    protected $table = 'fleet_vehicles';

    protected $fillable = [
        'tenant_id',
        'name',
        'plate_number',
        'make',
        'model',
        'year',
        'color',
        'vin',
        'type',
        'status',
        'odometer_km',
        'fuel_type',
        'assigned_to',
        'insurance_expiry',
        'registration_expiry',
        'notes',
    ];

    protected $casts = [
        'odometer_km'          => 'float',
        'insurance_expiry'     => 'date',
        'registration_expiry'  => 'date',
    ];

    public function assignedDriver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function fuelLogs(): HasMany
    {
        return $this->hasMany(FuelLog::class, 'vehicle_id');
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(VehicleMaintenance::class, 'vehicle_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(VehicleAssignment::class, 'vehicle_id');
    }

    public function isInsuranceExpiring(int $days = 30): bool
    {
        return $this->insurance_expiry !== null
            && $this->insurance_expiry->diffInDays(now()) <= $days
            && $this->insurance_expiry > now();
    }

    public function isRegistrationExpiring(int $days = 30): bool
    {
        return $this->registration_expiry !== null
            && $this->registration_expiry->diffInDays(now()) <= $days
            && $this->registration_expiry > now();
    }

    public function totalFuelCost(): float
    {
        return (float) $this->fuelLogs()->sum('total_cost');
    }

    public function totalMaintenanceCost(): float
    {
        return (float) $this->maintenances()->sum('cost');
    }
}

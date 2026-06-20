<?php

namespace App\Modules\Fleet\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleMaintenance extends Model
{
    use BelongsToTenant;

    protected $table = 'fleet_maintenances';

    protected $fillable = [
        'tenant_id',
        'vehicle_id',
        'type',
        'description',
        'vendor',
        'service_date',
        'due_date',
        'odometer_km',
        'cost',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'service_date' => 'date',
        'due_date'     => 'date',
        'cost'         => 'float',
        'odometer_km'  => 'float',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function complete(): void
    {
        $this->status = 'completed';
        $this->save();
    }
}

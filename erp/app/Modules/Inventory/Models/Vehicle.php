<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\HR\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'registration', 'make', 'model', 'year', 'vin', 'colour',
        'fuel_type', 'odometer_km', 'status', 'assigned_to_employee_id',
        'insurance_expiry', 'registration_expiry', 'notes',
    ];

    protected $casts = [
        'odometer_km'          => 'float',
        'insurance_expiry'     => 'date',
        'registration_expiry'  => 'date',
        'year'                 => 'integer',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(VehicleLog::class);
    }

    public function assignedEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_to_employee_id');
    }

    public function assign(int $employeeId): void
    {
        $this->assigned_to_employee_id = $employeeId;
        $this->status = 'in_use';
        $this->save();
    }

    public function unassign(): void
    {
        $this->assigned_to_employee_id = null;
        $this->status = 'available';
        $this->save();
    }

    public function retire(): void
    {
        $this->status = 'retired';
        $this->save();
    }

    public function getIsInsuranceExpiringAttribute(): bool
    {
        return $this->insurance_expiry !== null
            && $this->insurance_expiry->isFuture()
            && $this->insurance_expiry->diffInDays(now()) <= 30;
    }

    public function getIsRegistrationExpiringAttribute(): bool
    {
        return $this->registration_expiry !== null
            && $this->registration_expiry->isFuture()
            && $this->registration_expiry->diffInDays(now()) <= 30;
    }

    public function getTotalDistanceAttribute(): float
    {
        return (float) $this->logs()->sum('distance_km');
    }
}

<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\HR\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'asset_code', 'category', 'location',
        'assigned_to_employee_id', 'purchase_date', 'purchase_cost',
        'current_value', 'status', 'serial_number', 'notes', 'disposed_at',
    ];

    protected $casts = [
        'purchase_date'  => 'date',
        'disposed_at'    => 'datetime',
        'purchase_cost'  => 'decimal:2',
        'current_value'  => 'decimal:2',
    ];

    public function assignedEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_to_employee_id');
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(AssetMaintenance::class);
    }

    public function getDepreciationAttribute(): ?float
    {
        if ($this->purchase_cost !== null && $this->current_value !== null) {
            return round((float) $this->purchase_cost - (float) $this->current_value, 2);
        }

        return null;
    }

    public function dispose(): void
    {
        $this->status = 'disposed';
        $this->disposed_at = now();
        $this->save();
    }

    public function assignTo(int $employeeId): void
    {
        $this->assigned_to_employee_id = $employeeId;
        $this->status = 'active';
        $this->save();
    }
}

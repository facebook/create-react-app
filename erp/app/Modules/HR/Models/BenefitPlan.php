<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BenefitPlan extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'description',
        'employee_cost',
        'employer_cost',
        'is_active',
    ];

    protected $casts = [
        'employee_cost' => 'float',
        'employer_cost' => 'float',
        'is_active'     => 'boolean',
    ];

    public function enrollments(): HasMany
    {
        return $this->hasMany(EmployeeBenefit::class);
    }

    public function getTotalCostAttribute(): float
    {
        return $this->employee_cost + $this->employer_cost;
    }
}

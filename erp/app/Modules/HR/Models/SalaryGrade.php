<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalaryGrade extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'code', 'min_salary', 'mid_salary', 'max_salary',
        'currency', 'description', 'is_active',
    ];

    protected $casts = [
        'min_salary' => 'float',
        'mid_salary' => 'float',
        'max_salary' => 'float',
        'is_active'  => 'boolean',
    ];

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'salary_grade_id');
    }

    public function isSalaryInRange(float $salary): bool
    {
        return $salary >= $this->min_salary && $salary <= $this->max_salary;
    }

    public function getSalaryRangeAttribute(): string
    {
        return number_format($this->min_salary, 0) . ' - ' . number_format($this->max_salary, 0) . ' ' . $this->currency;
    }

    public function getMidpointAttribute(): float
    {
        return $this->mid_salary ?? (($this->min_salary + $this->max_salary) / 2);
    }
}

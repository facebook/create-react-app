<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Modules\HR\Models\LeaveBalance;

class Employee extends Model
{
    use BelongsToTenant;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'user_id', 'department_id', 'employee_number',
        'first_name', 'last_name', 'email', 'phone', 'position',
        'employment_type', 'status', 'start_date', 'hire_date', 'end_date',
        'salary_type', 'salary_amount', 'salary_grade_id', 'salary_structure_id',
    ];

    protected $casts = [
        'start_date'    => 'date',
        'end_date'      => 'date',
        'salary_amount' => 'decimal:2',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function salaryGrade(): BelongsTo
    {
        return $this->belongsTo(SalaryGrade::class);
    }

    public function salaryStructure(): BelongsTo
    {
        return $this->belongsTo(SalaryStructure::class, 'salary_structure_id');
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function payrollItems(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }

    public function onboardings(): HasMany
    {
        return $this->hasMany(EmployeeOnboarding::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /** @return string The employee code (e.g. EMP-00001) */
    public function getCodeAttribute(): string
    {
        if ($this->employee_number) {
            return $this->employee_number;
        }
        return 'EMP-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    /** hire_date alias for start_date (getter) */
    public function getHireDateAttribute()
    {
        return $this->start_date;
    }

    /** hire_date alias for start_date (setter) */
    public function setHireDateAttribute($value): void
    {
        $this->attributes['start_date'] = $value;
    }

    /** salary alias for salary_amount */
    public function getSalaryAttribute()
    {
        return $this->salary_amount;
    }

    /** termination_date alias for end_date */
    public function getTerminationDateAttribute()
    {
        return $this->end_date;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('first_name', 'like', "%{$term}%")
              ->orWhere('last_name', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%")
              ->orWhere('employee_number', 'like', "%{$term}%");
        });
    }

    public function emergencyContacts(): HasMany
    {
        return $this->hasMany(EmployeeEmergencyContact::class);
    }

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }
}

<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeePositionChange extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'employee_id', 'change_type',
        'from_title', 'to_title',
        'from_department_id', 'to_department_id',
        'from_salary', 'to_salary',
        'effective_date', 'reason', 'approved_by', 'approved_at', 'notes',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'from_salary'    => 'float',
        'to_salary'      => 'float',
        'approved_at'    => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function fromDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'from_department_id');
    }

    public function toDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'to_department_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approve(int $userId): void
    {
        $this->approved_by = $userId;
        $this->approved_at = now();
        $this->save();
    }

    public function getSalaryChangeAttribute(): float
    {
        if ($this->from_salary === null || $this->to_salary === null) {
            return 0.0;
        }
        return $this->to_salary - $this->from_salary;
    }

    public function getIsApprovedAttribute(): bool
    {
        return $this->approved_by !== null;
    }
}

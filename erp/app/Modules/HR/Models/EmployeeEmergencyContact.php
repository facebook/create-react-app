<?php

namespace App\Modules\HR\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeEmergencyContact extends Model
{
    protected $fillable = [
        'employee_id',
        'name',
        'relationship',
        'phone_primary',
        'phone_secondary',
        'email',
        'address',
        'is_primary',
        'notes',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    protected $attributes = [
        'is_primary' => false,
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function markAsPrimary(): void
    {
        // Clear any existing primary on this employee
        static::where('employee_id', $this->employee_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        $this->is_primary = true;
        $this->save();
    }

    protected function displayName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->name . ' (' . $this->relationship . ')',
        );
    }
}

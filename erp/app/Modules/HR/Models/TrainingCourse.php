<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingCourse extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'title', 'category', 'provider', 'type',
        'duration_hours', 'cost', 'is_mandatory', 'description', 'is_active',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'is_mandatory'   => 'boolean',
        'duration_hours' => 'integer',
        'cost'           => 'float',
    ];

    public function trainingRecords(): HasMany
    {
        return $this->hasMany(EmployeeTrainingRecord::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(TrainingEnrollment::class);
    }

    public function getEnrolledCountAttribute(): int
    {
        return $this->enrollments()->count();
    }
}

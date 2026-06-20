<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveType extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'code', 'days_per_year', 'default_days',
        'is_paid', 'is_active', 'requires_approval', 'description',
    ];

    protected $casts = [
        'is_paid'            => 'boolean',
        'is_active'          => 'boolean',
        'requires_approval'  => 'boolean',
        'default_days'       => 'integer',
        'days_per_year'      => 'integer',
    ];

    public function requests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class, 'leave_type_id');
    }

    /** Backward-compat alias */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /** Virtual: read default_days or fall back to days_per_year */
    public function getEffectiveDaysAttribute(): int
    {
        return $this->default_days ?: ($this->days_per_year ?: 0);
    }
}

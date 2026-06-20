<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class JobPosition extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'title',
        'department',
        'department_id',
        'location',
        'employment_type',
        'description',
        'requirements',
        'salary_min',
        'salary_max',
        'openings',
        'is_active',
        'status',
        'posted_at',
        'closes_at',
        'closed_at',
    ];

    protected $casts = [
        'salary_min'  => 'float',
        'salary_max'  => 'float',
        'openings'    => 'integer',
        'is_active'   => 'boolean',
        'posted_at'   => 'datetime',
        'closed_at'   => 'datetime',
        'closes_at'   => 'date',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function getIsOpenAttribute(): bool
    {
        if (!$this->is_active) {
            return false;
        }
        if ($this->closes_at === null) {
            return true;
        }
        return Carbon::parse($this->closes_at)->gte(Carbon::today());
    }

    public function getApplicationCountAttribute(): int
    {
        return $this->applications()->count();
    }

    public function getOpenApplicationsCountAttribute(): int
    {
        return $this->applications()->whereNotIn('stage', ['hired', 'rejected'])->count();
    }

    public function publish(): void
    {
        $this->status = 'open';
        $this->posted_at = now();
        $this->save();
    }

    public function close(): void
    {
        $this->status = 'closed';
        $this->closed_at = now();
        $this->save();
    }
}
